const supabase = require("../../lib/supabase").supabase;

const writingService = {
    //Get list writingParagraphs by typeExercises, level and type paragraph
    async getListWritingParagraphsByTypeLevelTypeParagraph(type_exercise_slug, level_slug, type_paragraph_slug) {
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
        if (!typeData) return [];

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
        if (!levelData) return [];

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
        if (!typeParagraphData) return [];

        const type_paragraph_id = typeParagraphData.id;

        // Bước 2: lấy writing_paragraph theo type, level và type_paragraph
        const { data: writingParagraphs, error: err1 } = await supabase
            .from("writingParagraphs")
            .select("*")
            .eq("type_exercise_id", type_exercise_id)
            .eq("level_id", level_id)
            .eq("type_paragraph_id", type_paragraph_id);

        if (err1) {
            console.error("Error fetching writing_paragraphs:", err1);
            throw err1;
        }

        return writingParagraphs;
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
                score,
                accuracy,
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