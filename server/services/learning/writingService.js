const supabase = require("../../lib/supabase").supabase;

const writingService = {
    //Get list writingParagraphs by typeExercises, level and type paragraph
    async getListWritingParagraphsByTypeLevelTypeParagraph(
        type_exercise_slug,
        level_slug,
        type_paragraph_slug,
        currentUserId,
        page = 1,
        limit = 10
    ) {
        // Bước 1: tìm id từ slug
        // Tìm type_exercise_id
        const { data: typeData, error: errType } = await supabase
            .from("typeExercises")
            .select("id")
            .eq("slug", type_exercise_slug)
            .maybeSingle();

        if (errType) {
            console.error("Error fetching typeExercises:", errType);
            throw errType;
        }
        if (!typeData) return { data: [], total: 0, currentPage: page, totalPages: 0 };

        const type_exercise_id = typeData.id;

        // Tìm level_id
        const { data: levelData, error: errLevel } = await supabase
            .from("levels")
            .select("id")
            .eq("slug", level_slug)
            .maybeSingle();

        if (errLevel) {
            console.error("Error fetching levels:", errLevel);
            throw errLevel;
        }
        if (!levelData) return { data: [], total: 0, currentPage: page, totalPages: 0 };

        const level_id = levelData.id;

        // Tìm type_paragraph_id
        const { data: typeParagraphData, error: errTypeParagraph } = await supabase
            .from("typeParagraphs")
            .select("id")
            .eq("slug", type_paragraph_slug)
            .maybeSingle();

        if (errTypeParagraph) {
            console.error("Error fetching typeParagraphs:", errTypeParagraph);
            throw errTypeParagraph;
        }
        if (!typeParagraphData) return { data: [], total: 0, currentPage: page, totalPages: 0 };

        const type_paragraph_id = typeParagraphData.id;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Bước 2: lấy writing_paragraph theo type, level và type_paragraph
        const { data: writingParagraphs, count, error: err1 } = await supabase
            .from("writingParagraphs")
            .select("*", { count: "exact" })
            .eq("type_exercise_id", type_exercise_id)
            .eq("level_id", level_id)
            .eq("type_paragraph_id", type_paragraph_id)
            .range(from, to);

        if (err1) {
            console.error("Error fetching writing_paragraphs:", err1);
            throw err1;
        }

        const filtered = writingParagraphs.filter((item) => {
            // Nếu không có genAI → cho phép hiển thị
            if (!item.genAI) return true;

            // Nếu genAI của item không có userId → cho phép hiển thị
            if (!item.genAI.userId) return true;

            // Nếu userId match user hiện tại → cho phép
            if (item.genAI.userId === currentUserId) return true;

            // Nếu genAI có isPublic = true → cho phép hiển thị
            if (item.genAI.isPublic) return true;

            // Ngược lại → không hiển thị
            return false;
        });

        // Lấy danh sách ID để query progress
        const paragraphIds = filtered.map((p) => p.id);

        const { data: progresses } = await supabase
            .from("progressWritingParagraph")
            .select("writingParagraph_id, submit_times, isCorrect")
            .eq("user_id", currentUserId)
            .in("writingParagraph_id", paragraphIds);

        // Map progress vào từng paragraph
        const progressMap = {};
        progresses?.forEach((p) => {
            progressMap[p.writingParagraph_id] = {
                submit_times: p.submit_times,
                isCorrect: p.isCorrect,
            };
        });

        const result = filtered.map((item) => ({
            ...item,
            submit_times: progressMap[item.id]?.submit_times ?? 0,
            isCorrect: progressMap[item.id]?.isCorrect ?? null,
        }));

        function getRank(i) {
            if (i.isCorrect === false) return 1; // Sai
            if (i.submit_times === 0) return 2;  // Chưa nộp
            if (i.isCorrect === true) return 4;  // Đúng
            return 3;                            // Đã nộp nhưng chưa đúng
        }   

        result.sort((a, b) => getRank(a) - getRank(b));

        return {
            data: result,
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        };
    },

    //Get writingParagraph by id
    async getWritingParagraphById(id) {
        const { data: exercise, error: err } = await supabase
            .from("writingParagraphs")
            .select("*")
            .eq("id", id)
            .single();

        if (err) {
            console.error("Error fetching writingParagraph:", err);
            throw err;
        }

        return exercise;
    },

    // Lưu submit bài tập writingParagraph
    async submitWritingParagraphExercise(data) {
        const { data: insertedData, error } = await supabase
            .from("submitExParagraph")
            .insert(data)
            .select();

        if (error) {
            console.error("Error submitting writing paragraph exercise:", error);
            throw error;
        }

        return insertedData;
    },

    // Lấy progress bài tập writingParagraph của user
    async getProgressWritingParagraph(user_id, paragraph_id) {
        const { data: progress, error } = await supabase
            .from("progressWritingParagraph")
            .select("*")
            .eq("user_id", user_id)
            .eq("writingParagraph_id", paragraph_id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching writing progress:", error);
            throw error;
        }

        return progress;
    },

    // Lưu progress bài tập writingParagraph
    async saveProgressWritingParagraph(data) {
        const { data: insertedData, error } = await supabase
            .from("progressWritingParagraph")
            .insert(data)
            .select();
        if (error) {
            console.error("Error saving writing progress:", error);
            throw error;
        }
        return insertedData;
    },

    // Cập nhật progress bài tập writingParagraph
    async updateProgressWritingParagraph(user_id, paragraph_id, data) {
        const { data: updatedData, error } = await supabase
            .from("progressWritingParagraph")
            .update(data)
            .eq("user_id", user_id)
            .eq("writingParagraph_id", paragraph_id)
            .select();

        if (error) {
            console.error("Error updating writing progress:", error);
            throw error;
        }

        return updatedData;
    },

    // Get all history submit writingParagraph with feedback information by user_id and paragraph_id
    async getAllHistorySubmitWritingParagraph(user_id, paragraph_id) {
        const { data: history, error } = await supabase
            .from("submitExParagraph")
            .select(`
            id,
            user_id,
            exParagraph_id,
            content_submit,
            submit_date,
            feedback:feedbackParagraphAI (
                id,
                comment,
                final_score,
                accuracy,
                grammar,
                vocabulary,
                strengths,
                errors: errorFeedback (
                    id,
                    original,
                    error_type,
                    highlight,
                    suggestion: suggestions
                )
            )
        `)
            .eq("user_id", user_id)
            .eq("exParagraph_id", paragraph_id)
            .order("submit_date", { ascending: false });

        if (error) {
            console.error("Error fetching writing history:", error);
            throw error;
        }
        return history;
    }
};

module.exports = writingService;