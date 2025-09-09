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
            .single();

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
            .single();

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
            .single();

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
};

module.exports = writingService;