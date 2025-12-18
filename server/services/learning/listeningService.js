const supabase = require("../../lib/supabase").supabase;

const listeningService = {
    // Get list listeningExercises by id
    async getListeningExerciseById(id) {
        const { data, error } = await supabase
            .from("listenParagraphs")
            .select("*, wordHidden(position, answer, id)")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching listening exercise:", error);
            throw new Error("Error fetching listening exercise");
        }

        return data;
    },

    // Get all listening exercises by level_slug and topic_slug
    async getListeningExercises(
        level_slug,
        topic_slug,
        page = 1,
        limit = 6,
        user_id = null
    ) {
        const { data: levelData } = await supabase
            .from("levels")
            .select("id")
            .eq("slug", level_slug)
            .single();

        const { data: topicData } = await supabase
            .from("topics")
            .select("id")
            .eq("slug", topic_slug)
            .single();

        if (!levelData || !topicData) {
            throw new Error("Không tìm thấy level hoặc topic tương ứng");
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Query danh sách bài tập + đếm tổng số từ hidden
        const { data, count, error } = await supabase
            .from("listenParagraphs")
            .select("*, levels(slug), topics(slug), wordHidden(count)", {
                count: "exact",
            })
            .eq("level_id", levelData.id)
            .eq("topic_id", topicData.id)
            .range(from, to);

        if (error) {
            console.error("Error fetching listening exercises:", error);
            throw new Error("Error fetching listening exercises");
        }

        // Nếu có user_id, lấy tiến độ của user cho các bài tập này
        let exercisesWithProgress = data;

        if (user_id && data.length > 0) {
            const exerciseIds = data.map((ex) => ex.id);

            // Lấy progress của user cho các bài tập trong list
            const { data: progressData, error: progressError } = await supabase
                .from("progressListenParagraph")
                .select("listen_para_id, number_word_completed")
                .in("listen_para_id", exerciseIds)
                .eq("user_id", user_id);

            if (!progressError && progressData) {
                // Map progress vào data gốc
                exercisesWithProgress = data.map((ex) => {
                    // Tìm record progress tương ứng
                    const progressItem = progressData.find(
                        (p) => p.listen_para_id === ex.id
                    );

                    // Lấy tổng số từ (wordHidden trả về mảng object count, vd: [{count: 10}])
                    const totalWords =
                        ex.wordHidden && ex.wordHidden[0] ? ex.wordHidden[0].count : 0;

                    // Số từ đã làm đúng
                    const completedWords = progressItem
                        ? progressItem.number_word_completed
                        : 0;

                    // Tính phần trăm: (đã làm / tổng số) * 100
                    let calculatedProgress = 0;
                    if (totalWords > 0) {
                        calculatedProgress = Math.round(
                            (completedWords / totalWords) * 100
                        );
                    }

                    // Trả về object đã merge data, loại bỏ mảng wordHidden thừa
                    const { wordHidden, ...rest } = ex;
                    return {
                        ...rest,
                        progress: calculatedProgress, // Trường progress frontend cần
                    };
                });
            }
        } else {
            // Nếu không có user_id, mặc định progress = 0
            exercisesWithProgress = data.map((ex) => {
                const { wordHidden, ...rest } = ex;
                return { ...rest, progress: 0 };
            });
        }

        // Sort theo progress đang làm -> chưa làm -> hoàn thành
        exercisesWithProgress.sort((a, b) => {
            return a.progress - b.progress;
        });

        return { data: exercisesWithProgress, total: count };
    },

    // Submit listening exercise results
    async submitListeningResults(user_id, ex_listen_id) {
        const { data, error } = await supabase
            .from("submitExListen")
            .insert([{ user_id, ex_listen_id }])
            .select()
            .single();
        if (error) {
            console.error("Error submitting listening results:", error);
            throw new Error("Error submitting listening results");
        }
        return data;
    },

    // Save word answers
    async saveWordAnswers(data) {
        const { data: result, error } = await supabase
            .from("wordAnswer")
            .insert(data)
            .select();
        if (error) {
            console.error("Error saving word answers:", error);
            throw new Error("Error saving word answers");
        }
        return result;
    },

    // Lấy tiến độ học của user
    async getUserProgress(user_id, listen_para_id) {
        const { data: progress, error } = await supabase
            .from("progressListenParagraph")
            .select("*")
            .eq("user_id", user_id)
            .eq("listen_para_id", listen_para_id)
            .maybeSingle();
        if (error) {
            console.error("Error fetching user progress:", error);
            throw new Error("Error fetching user progress");
        }
        return progress;
    },

    // Tạo mới tiến độ học
    async createUserProgress(data) {
        const { user_id, listen_para_id, number_word_completed, lastSubmit, completed_date, submit_times, score, isCorrect } = data;
        const { data: result, error } = await supabase
            .from("progressListenParagraph")
            .insert({ user_id, listen_para_id, number_word_completed, lastSubmit, completed_date, submit_times, score, isCorrect })
            .select()
            .single();
        if (error) {
            console.error("Error creating user progress:", error);
            throw new Error("Error creating user progress");
        }
        return result;
    },

    // Cập nhật tiến độ học
    async updateUserProgress(user_id, listen_para_id,data) {
        const { data: result, error } = await supabase
            .from("progressListenParagraph")
            .update(data)
            .eq("user_id", user_id)
            .eq("listen_para_id", listen_para_id)
            .select()
            .single();
        if (error) {
            console.error("Error updating user progress:", error);
            throw new Error("Error updating user progress");
        }
        return result;
    },

    // Lấy lịch sử nộp bài nghe của user
    async getAllHistorySubmitListeningByUser(user_id, listen_para_id) {
        const { data, error } = await supabase
            .from("submitExListen")
            .select(`
                id,
                created_at,
                answers:wordAnswer(
                    word_hidden_id,
                    answer_input,
                    is_correct
                )
            `)
            .eq("user_id", user_id)
            .eq("ex_listen_id", listen_para_id)
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Error fetching history submit listening:", error);
            throw new Error("Error fetching history submit listening");
        }
        return data;
    }
};

module.exports = listeningService;