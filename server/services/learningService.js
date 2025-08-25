const supabase = require("../lib/supabase").supabase;

const learningService = {
    //   getType_Exercises by slug
    async getTypeExercisesBySlug(slug) {
        const { data, error } = await supabase
            .from("type_exercises")
            .select(`
      id,
      slug,
      title,
      description,
      features,
      icon:icon_id (name, color)
    `) // join với bảng icon
            .eq("slug", slug)
            .single();

        if (error) throw error;
        return data;
    },

    // Get all levels by type_exercise
    async getAllLevelsByTypeExercise(type_exercise_slug) {
        // Bước 0: tìm id từ slug
        const { data: typeData, error: errType } = await supabase
            .from("type_exercises")
            .select("id")
            .eq("slug", type_exercise_slug)
            .single();

        if (errType) {
            console.error("Error fetching type_exercises:", errType);
            throw errType;
        }
        if (!typeData) return [];

        const type_exercise_id = typeData.id;

        // Bước 1: lấy level_id từ bảng writing_exercises
        const { data: exerciseLevels, error: err1 } = await supabase
            .from("writing_exercises")
            .select("level_id")
            .eq("type_exercise_id", type_exercise_id);

        if (err1) {
            console.error("Error fetching writing_exercises:", err1);
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

    // Get all topic by type_exercise
    async getAllTopicsByTypeExercise(type_exercise_slug) {
        // Bước 0: tìm id từ slug
        const { data: typeData, error: errType } = await supabase
            .from("type_exercises")
            .select("id")
            .eq("slug", type_exercise_slug)
            .single();

        if (errType) {
            console.error("Error fetching type_exercises:", errType);
            throw errType;
        }
        if (!typeData) return [];

        const type_exercise_id = typeData.id;

        // Bước 1: lấy topic_id từ bảng writing_exercises
        const { data: exerciseTopics, error: err1 } = await supabase
            .from("writing_exercises")
            .select("topic_id")
            .eq("type_exercise_id", type_exercise_id);

        if (err1) {
            console.error("Error fetching writing_exercises:", err1);
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
    }
};

module.exports = learningService;
