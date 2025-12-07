const { supabase } = require("../../lib/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const promptGenerateTopicVocab = require("../../utils/prompt/generateTopicVocab");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  async generateTopicsForUser(userId) {
    // Lấy từ chưa có topic
    const { data: vocabs, error: vocabError } = await supabase
      .from("personalVocab")
      .select("id, word")
      .eq("userId", userId)
      .eq("created", false);

    if (vocabError) throw vocabError;
    if (!vocabs?.length) return { message: "Không có từ mới cần phân loại." };

    const words = vocabs.map((v) => v.word);

    // Lấy danh sách topic hiện có ĐỂ LÀM CONTEXT CHO AI
    const { data: existingTopics, error: topicError } = await supabase
      .from("topicsVocab")
      .select("id, name_en")
      .eq("userId", userId);

    if (topicError) throw topicError;

    // Gọi Gemini
    const prompt = promptGenerateTopicVocab(words, existingTopics);
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
    const result = await model.generateContent(prompt);

    // Xử lý JSON an toàn hơn
    const text = result.response.text();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
    let json;
    try {
      json = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
    } catch (e) {
      console.error("Gemini Response Error:", text);
      throw new Error("AI trả về định dạng không hợp lệ.");
    }

    const topicMap = new Map();
    existingTopics.forEach((t) => topicMap.set(t.name_en.toLowerCase(), t.id));

    // Mảng chứa các promise để chạy song song
    for (const item of json) {
      const vocab = vocabs.find(
        (v) => v.word.toLowerCase() === item.word.toLowerCase()
      );
      if (!vocab) continue;

      for (const topicObj of item.topics) {
        const { name_en, name_vi } =
          typeof topicObj === "string"
            ? { name_en: topicObj, name_vi: null }
            : topicObj;

        const topicKey = name_en.toLowerCase();
        let topicId = topicMap.get(topicKey);

        // Nếu chưa có trong Map (tức là chưa có trong DB hoặc mới tạo ở vòng lặp trước)
        if (!topicId) {
          const { data: foundTopic } = await supabase
            .from("topicsVocab")
            .select("id")
            .eq("userId", userId)
            .eq("name_en", name_en)
            .maybeSingle();

          if (foundTopic) {
            topicId = foundTopic.id;
          } else {
            // Tạo mới
            const { data: newTopic, error: insertErr } = await supabase
              .from("topicsVocab")
              .insert({
                created_at: new Date().toISOString(),
                userId,
                name_en,
                name_vi,
                total_vocab: 0,
              })
              .select("id")
              .single();

            if (insertErr) {
              console.error("Lỗi tạo topic:", insertErr);
              continue;
            }
            topicId = newTopic.id;
          }
          // Lưu vào Map để các từ sau dùng lại mà không cần query DB
          topicMap.set(topicKey, topicId);
        }

        // Tạo liên kết giữa vocab và topic (trigger sẽ tự tăng total_vocab)
        const { data: existingRelation } = await supabase
          .from("personalVocabTopics")
          .select("id")
          .eq("personal_vocab_id", vocab.id)
          .eq("topic_vocab_id", topicId)
          .maybeSingle();

        if (!existingRelation) {
          const { error: linkErr } = await supabase
            .from("personalVocabTopics")
            .insert({
              personal_vocab_id: vocab.id,
              topic_vocab_id: topicId,
              created_at: new Date().toISOString(),
            });

          if (linkErr) throw linkErr;
        } else {
          console.log(
            `Relation already exists for vocabId=${vocab.id}, topicId=${topicId}`
          );
        }
      }
    }

    // Update trạng thái created = true CHO TẤT CẢ vocab cùng lúc
    const vocabIds = vocabs.map((v) => v.id);
    if (vocabIds.length > 0) {
      const { error: updateErr } = await supabase
        .from("personalVocab")
        .update({ created: true })
        .in("id", vocabIds); // Dùng .in để update hàng loạt

      if (updateErr) throw updateErr;
    }

    return {
      success: true,
      message: `Đã phân loại ${vocabIds.length} từ vựng.`,
    };
  },

  // Đổi tên hàm cho đúng nghĩa
  async checkUnclassifiedVocab(userId) {
    const { count, error } = await supabase
      .from("personalVocab")
      .select("*", { count: "exact", head: true }) // head: true chỉ đếm, không tải data
      .eq("userId", userId)
      .eq("created", false);

    if (error) throw error;

    return { count, error };
  },
};
