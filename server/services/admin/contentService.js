const supabase = require("../../lib/supabase").supabase;

const contentService = {
  // ====== (GET) ======

  loadListeningParagraphs: async ({ levelId, topicId }) => {
    const { data, error } = await supabase.rpc("get_listening_paragraphs", {
      level_id_filter: levelId || null,
      topic_id_filter: topicId || null,
    });
    if (error) return { data: null, error };
    return { data, error: null };
  },

  loadWritingExercises: async ({
    levelId,
    topicId,
    typeExerciseId,
    typeParagraphId,
  }) => {
    const { data, error } = await supabase.rpc("get_writing_exercises", {
      level_id_filter: levelId || null,
      topic_id_filter: topicId || null,
      type_exercise_id_filter: typeExerciseId || null,
      type_paragraph_id_filter: typeParagraphId || null,
    });
    if (error) return { data: null, error };
    return { data, error: null };
  },

  loadSpeakingLessons: async ({ levelId, topicId }) => {
    let query = supabase
      .from("speakingLessons")
      .select(
        `
        id, content, topic_id, level_id, created_at,
        level_name: levels(name_en),
        topic_name: topics(name_en)
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (levelId) query = query.eq("level_id", levelId);
    if (topicId) query = query.eq("topic_id", topicId);

    const { data, error } = await query;
    if (error) return { data: null, error };
    return { data, error: null };
  },

  loadTopics: async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("id, name_en, name_vi")
      .order("id");
    if (error) return { data: null, error };
    return { data, error: null };
  },

  loadLevels: async () => {
    const { data, error } = await supabase
      .from("levels")
      .select("id, name_en, name_vi")
      .order("id", { ascending: true });

    if (error) return { data: null, error };
    return { data, error: null };
  },

  loadTypeExercises: async () => {
    const { data, error } = await supabase
      .from("typeExercises")
      .select("id, title_en, title_vi")
      .order("id");
    if (error) return { data: null, error };
    return { data, error: null };
  },

  loadTypeParagraphs: async () => {
    const { data, error } = await supabase
      .from("typeParagraphs")
      .select("id, name_en, name_vi")
      .order("id");
    if (error) return { data: null, error };
    return { data, error: null };
  },

  // ====== CREATE (POST) ======

  createListeningParagraph: async (paragraphData) => {
    const { data, error } = await supabase
      .from("listenParagraphs")
      .insert(paragraphData)
      .select()
      .single();
    if (error) return { data: null, error };
    return { data, error: null };
  },

  createSpeakingLesson: async (lessonData) => {
    const { data, error } = await supabase
      .from("speakingLessons")
      .insert(lessonData)
      .select()
      .single();
    if (error) return { data: null, error };
    return { data, error: null };
  },

  createWritingExercise: async (exerciseData) => {
    const { data, error } = await supabase
      .from("writingParagraphs")
      .insert(exerciseData)
      .select()
      .single();
    if (error) return { data: null, error };
    return { data, error: null };
  },

  // ====== UPDATE ======

  updateListeningParagraph: async (id, paragraphData) => {
    const { data, error } = await supabase
      .from("listenParagraphs")
      .update(paragraphData)
      .eq("id", id)
      .select()
      .single();
    if (error) return { data: null, error };
    return { data, error: null };
  },

  updateWritingExercise: async (id, exerciseData) => {
    const { data, error } = await supabase
      .from("writingParagraphs")
      .update(exerciseData)
      .eq("id", id)
      .select()
      .single();
    if (error) return { data: null, error };
    return { data, error: null };
  },

  // ====== DELETE ======

  deleteListeningParagraph: async (id) => {
    const { data, error } = await supabase
      .from("listenParagraphs")
      .delete()
      .eq("id", id);
    if (error) return { data: null, error };
    return { data, error: null };
  },

  deleteSpeakingLesson: async (id) => {
    const { data, error } = await supabase
      .from("speakingLessons")
      .delete()
      .eq("id", id);
    if (error) return { data: null, error };
    return { data, error: null };
  },

  deleteWritingExercise: async (id) => {
    const { data, error } = await supabase
      .from("writingParagraphs")
      .delete()
      .eq("id", id);
    if (error) return { data: null, error };
    return { data, error: null };
  },
};

module.exports = contentService;
