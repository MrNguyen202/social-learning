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
    async getListeningExercises(level_slug, topic_slug) {
        // Lấy level_id và topic_id tương ứng với slug
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

        // Sau đó lọc theo id (vì listenParagraphs chứa level_id, topic_id)
        const { data, error } = await supabase
            .from("listenParagraphs")
            .select("*, levels(slug), topics(slug)")
            .eq("level_id", levelData.id)
            .eq("topic_id", topicData.id);

        if (error) {
            console.error("Error fetching listening exercises:", error);
            throw new Error("Error fetching listening exercises");
        }

        return data;
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
        const { user_id, listen_para_id, number_word_completed, status, lastSubmit, completed_date } = data;
        const { data: result, error } = await supabase
            .from("progressListenParagraph")
            .insert({ user_id, listen_para_id, number_word_completed, status, lastSubmit, completed_date })
            .select()
            .single();
        if (error) {
            console.error("Error creating user progress:", error);
            throw new Error("Error creating user progress");
        }
        return result;
    },

    // Cập nhật tiến độ học
    async updateUserProgress(data) {
        const { user_id, listen_para_id, number_word_completed, status, lastSubmit, completed_date, submit_times } = data;
        const { data: result, error } = await supabase
            .from("progressListenParagraph")
            .update({ number_word_completed, status, lastSubmit, completed_date, submit_times })
            .eq("user_id", user_id)
            .eq("listen_para_id", listen_para_id)
            .select()
            .single();
        if (error) {
            console.error("Error updating user progress:", error);
            throw new Error("Error updating user progress");
        }
        return result;
    }
};

module.exports = listeningService;