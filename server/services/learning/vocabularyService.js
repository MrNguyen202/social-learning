const supabase = require("../../lib/supabase").supabase;

const vocabularyService = {
  async insertOrUpdateVocabulary(userId, vocabData) {
    // Kiểm tra từ đã tồn tại chưa
    const { data: existing, error: checkError } = await supabase
      .from("userVocabErrors")
      .select("id,error_count")
      .eq("userId", userId)
      .eq("word", vocabData.word)
      .eq("error_type", vocabData.error_type)
      .eq("skill", vocabData.skill)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Nếu đã tồn tại, tăng error_count
      const { data, error } = await supabase
        .from("userVocabErrors")
        .update({
          error_count: existing.error_count + 1,
          created_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error };
    } else {
      // Nếu chưa có, insert mới
      const { data, error } = await supabase
        .from("userVocabErrors")
        .insert({
          userId,
          word: vocabData.word,
          error_type: vocabData.error_type,
          skill: vocabData.skill,
          error_count: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error };
    }
  },

  // Lưu mảng từ vựng cá nhân vào bảng personalVocab khi generate từ AI
  async updatePersonalVocab(userId, word, dataVocab) {
    const { data, error } = await supabase
      .from("personalVocab")
      .update({
        related_words: dataVocab,
        created_related_words: true,
      })
      .eq("userId", userId)
      .eq("word", word)
      .select();

    if (error) throw error;
    return { data, error };
  },

  // Lấy danh sách từ vựng cá nhân của người dùng dựa trên userId và created_related_words = true và related_words đã được tạo ( đã generate related_words )
  async getListPersonalVocabByUserIdAndCreated(userId) {
    const { data, error } = await supabase
      .from("personalVocab")
      .select(
        `
        id,
        word,
        error_count,
        mastery_score,
        related_words
      `
      )
      .eq("userId", userId)
      .eq("created_related_words", true)
      .gte("error_count", 5);

    if (error) throw error;

    return { data, error };
  },

  // Lấy từ vựng cá nhân dựa trên personalVocabId
  async getPersonalVocabById(personalVocabId) {
    const { data, error } = await supabase
      .from("personalVocab")
      .select("*")
      .eq("id", personalVocabId)
      .single();

    if (error) throw error;

    return { data, error };
  },

  // Lấy tổng số các từ vựng trong khoảng mastery_score
  async getSumPersonalVocabByMasteryScore(userId, from, to) {
    const { data, error } = await supabase
      .from("personalVocab")
      .select("id, mastery_score")
      .eq("userId", userId)
      .eq("created_related_words", true)
      .gte("mastery_score", from)
      .lte("mastery_score", to);

    if (error) throw error;

    const total = data.reduce((sum, item) => sum + 1, 0);

    return { data, total, error };
  },

  // Lấy danh sách chủ đề từ vựng của người dùng
  async getUserTopics(userId) {
    const { data, error } = await supabase
      .from("topicsVocab")
      .select("id, name_en, name_vi, total_vocab")
      .eq("userId", userId)
      .order("name_en", { ascending: true });

    if (error) throw error;

    return { data, error };
  },

  // Lấy danh sách từ vựng theo chủ đề
  async getVocabByTopic(userId, topicId) {
    const { data, error } = await supabase
      .from("personalVocabTopics")
      .select(
        `
      id,
      personalVocab:personal_vocab_id (
        id,
        word,
        related_words,
        mastery_score,
        userId
      ),
      topicsVocab:topic_vocab_id (
        name_en,
        name_vi
      )
    `
      )
      .eq("topic_vocab_id", topicId);

    if (error) throw error;

    // Lọc vocab đúng user
    const filtered = data.filter(
      (item) => item.personalVocab?.userId === userId
    );

    // Nếu không có dữ liệu thì return sớm
    if (filtered.length === 0) return { data: [], error: null };

    // Lấy topic info (giống nhau cho tất cả vì cùng topicId)
    const { name_en, name_vi } = filtered[0].topicsVocab;

    // Map danh sách vocab
    const vocabList = filtered.map((item) => ({
      id: item.personalVocab.id,
      word: item.personalVocab.word,
      related_words: item.personalVocab.related_words,
      mastery_score: item.personalVocab.mastery_score,
    }));

    return { data: vocabList, name_en, name_vi, error };
  },

  // Cập nhật điểm mastery_score cho từ vựng cá nhân bằng rpc
  async updateMasteryScoreRPC(userId, word) {
    const { data, error } = await supabase.rpc("update_mastery_on_success", {
      user_id: userId,
      word_input: word,
    });

    if (error) throw error;

    return { data, error };
  },
};
module.exports = vocabularyService;
