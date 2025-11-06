const supabase = require("../../lib/supabase").supabase;

const learningService = {
  //   getType_Exercises by slug
  async getTypeExercisesBySlug(slug) {
    const { data, error } = await supabase
      .from("typeExercises")
      .select(
        `
      id,
      slug,
      title_vi,
      title_en,
      description_vi,
      description_en,
      features_vi,
      features_en,
      icon:icon_id (name, color)
    `
      ) // join với bảng icon
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
      .select(
        `
            id,
            name_vi,
            description_vi,
            slug,
            icon: icon_id (name, color),
            name_en,
            description_en
        `
      )
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
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .in("id", topicIds);

    if (err2) {
      console.error("Error fetching topics:", err2);
      throw err2;
    }

    return topics;
  },

  //Get all levels
  async getAllLevels() {
    const { data, error } = await supabase.from("levels").select(`
            id,
            name_vi,
            description_vi,
            slug,
            icon: icon_id (name, color),
            name_en,
            description_en
        `);

    if (error) {
      console.error("Error fetching levels:", error);
      throw error;
    }

    return data;
  },

  // Get all type paragraphs
  async getAllTypeParagraphs() {
    const { data, error } = await supabase.from("typeParagraphs").select(`
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
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
    const { data, error } = await supabase.from("topics").select(`
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
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
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching level by id:", error);
      throw error;
    }
    return data;
  },

  // Get level by slug
  async getLevelBySlug(slug) {
    const { data, error } = await supabase
      .from("levels")
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching level by slug:", error);
      throw error;
    }
    return data;
  },

  // Get topic by slug
  async getTopicBySlug(slug) {
    const { data, error } = await supabase
      .from("topics")
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching topic by slug:", error);
      throw error;
    }
    return data;
  },

  // Get type paragraph by id
  async getTypeParagraphById(id) {
    const { data, error } = await supabase
      .from("typeParagraphs")
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching type paragraph by id:", error);
      throw error;
    }
    return data;
  },

  // Get type paragraph by slug
  async getTypeParagraphBySlug(slug) {
    const { data, error } = await supabase
      .from("typeParagraphs")
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .eq("slug", slug)
      .single();
    if (error) {
      console.error("Error fetching type paragraph by slug:", error);
      throw error;
    }
    return data;
  },

  // Get levels by name_vi
  async getLevelsByNameVi(name_vi) {
    const { data, error } = await supabase
      .from("levels")
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .ilike("name_vi", `%${name_vi}%`);
    if (error) {
      console.error("Error fetching levels by name_vi:", error);
      throw error;
    }
    return data;
  },

  // Get topics by name_vi
  async getTopicsByNameVi(name_vi) {
    const { data, error } = await supabase
      .from("topics")
      .select(
        `
            id,
            name_vi,
            description_vi,
            name_en,
            description_en,
            slug,
            icon: icon_id (name, color)
        `
      )
      .ilike("name_vi", `%${name_vi}%`);
    if (error) {
      console.error("Error fetching topics by name_vi:", error);
      throw error;
    }
    return data;
  }
};

module.exports = learningService;
