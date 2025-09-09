const supabase = require("../../lib/supabase").supabase;

const learningService = {
    //   getType_Exercises by slug
    async getTypeExercisesBySlug(slug) {
        const { data, error } = await supabase
            .from("typeExercises")
            .select(`
      id,
      slug,
      title,
      description,
      features,
      icon:icon_id (name, color)
    `) // join với bảng icon
            .eq("slug", slug)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // Get all levels by typeExercises
    async getAllLevelsByTypeExercise(type_exercise_slug) {
        // Bước 0: tìm id từ slug
        const { data: typeData, error: errType } = await supabase
            .from("typeExercises")
            .select("id")
            .eq("slug", type_exercise_slug)
            .single();

        if (errType) {
            console.error("Error fetching type_exercises:", errType);
            throw errType;
        }
        if (!typeData) return [];

        const type_exercise_id = typeData.id;

        // Bước 1: lấy level_id từ bảng writingParagraphs
        const { data: exerciseLevels, error: err1 } = await supabase
            .from("writingParagraphs")
            .select("level_id")
            .eq("type_exercise_id", type_exercise_id);

        if (err1) {
            console.error("Error fetching writingParagraphs:", err1);
            throw err1;
        }

        if (!exerciseLevels || exerciseLevels.length === 0) return [];

        const levelIds = [...new Set(exerciseLevels.map((item) => item.level_id))];

        // Bước 2: query levels cùng icon
        const { data: levels, error: err2 } = await supabase
            .from("levels")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `)
            .in("id", levelIds);

        if (err2) {
            console.error("Error fetching levels:", err2);
            throw err2;
        }

        return levels;
    },

    // Get all topic by typeExercises
    async getAllTopicsByTypeExercise(type_exercise_slug) {
        // Bước 0: tìm id từ slug
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

        // Bước 1: lấy topic_id từ bảng writingParagraphs
        const { data: exerciseTopics, error: err1 } = await supabase
            .from("writingParagraphs")
            .select("topic_id")
            .eq("type_exercise_id", type_exercise_id);

        if (err1) {
            console.error("Error fetching writingParagraphs:", err1);
            throw err1;
        }

        if (!exerciseTopics || exerciseTopics.length === 0) return [];

        const topicIds = [...new Set(exerciseTopics.map((item) => item.topic_id))];

        // Bước 2: query topics cùng icon
        const { data: topics, error: err2 } = await supabase
            .from("topics")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `)
            .in("id", topicIds);

        if (err2) {
            console.error("Error fetching topics:", err2);
            throw err2;
        }

        return topics;
    },

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

    //Get all levels
    async getAllLevels() {
        const { data, error } = await supabase
            .from("levels")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `);

        if (error) {
            console.error("Error fetching levels:", error);
            throw error;
        }

        return data;
    },

    // Get all type paragraphs
    async getAllTypeParagraphs() {
        const { data, error } = await supabase
            .from("typeParagraphs")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `);
        if (error) {
            console.error("Error fetching typeParagraphs:", error);
            throw error;
        }
        return data;
    },

    // Get all topics
    async getAllTopics() {
        const { data, error } = await supabase
            .from("topics")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `);
        if (error) {
            console.error("Error fetching topics:", error);
            throw error;
        }
        return data;
    },

    // Get level by id
    async getLevelById(id) {
        const { data, error } = await supabase
            .from("levels")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `)
            .eq("id", id)
            .single();
        if (error) {
            console.error("Error fetching level by id:", error);
            throw error;
        }
        return data;
    },

    // Get type paragraph by id
    async getTypeParagraphById(id) {
        const { data, error } = await supabase
            .from("typeParagraphs")
            .select(`
            id,
            name,
            description,
            slug,
            icon: icon_id (name, color)
        `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching type paragraph by id:", error);
            throw error;
        }
        return data;
    },
};

module.exports = learningService;
