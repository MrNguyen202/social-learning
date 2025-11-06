const { supabase } = require("../../lib/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const promptGenerateTopicVocab = require("../../utils/prompt/generateTopicVocab");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  async generateTopicsForUser(userId) {
    // 1️⃣ Lấy từ chưa có topic
    const { data: vocabs, error: vocabError } = await supabase
      .from("personalVocab")
      .select("id, word")
      .eq("userId", userId)
      .eq("created", false);

    if (vocabError) throw vocabError;
    if (!vocabs?.length) return { message: "Không có từ mới cần phân loại." };

    const words = vocabs.map((v) => v.word);

    // 2️⃣ Lấy danh sách topic hiện có
    const { data: existingTopics, error: topicError } = await supabase
      .from("topicsVocab")
      .select("id, name_en")
      .eq("userId", userId);

    if (topicError) throw topicError;

    // 3️⃣ Gọi Gemini
    const prompt = promptGenerateTopicVocab(words, existingTopics);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    const text = result.response.text();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
    if (!jsonMatch)
      throw new Error("Gemini không trả về JSON hợp lệ:\n" + text);

    const json = JSON.parse(jsonMatch[1]);

    // 4️⃣ Xử lý từng từ và topic
    for (const item of json) {
      const vocab = vocabs.find(
        (v) => v.word.toLowerCase() === item.word.toLowerCase()
      );
      if (!vocab || !vocab.id) {
        console.warn("⚠️ Không tìm thấy vocab hợp lệ cho:", item.word);
        continue;
      }

      for (const topicObj of item.topics) {
        const { name_en, name_vi } =
          typeof topicObj === "string"
            ? { name_en: topicObj, name_vi: null }
            : topicObj;

        // 🔎 Kiểm tra topic đã tồn tại chưa
        let topicId;
        const { data: existing, error: existErr } = await supabase
          .from("topicsVocab")
          .select("id")
          .eq("userId", userId)
          .eq("name_en", name_en)
          .maybeSingle();

        if (existErr) throw existErr;

        if (existing) {
          topicId = existing.id;
        } else {
          // 🆕 Tạo topic mới (total_vocab sẽ do trigger tự set khi insert vào bảng liên kết)
          const { data: newTopic, error: insertErr } = await supabase
            .from("topicsVocab")
            .insert({
              created_at: new Date().toISOString(),
              userId,
              name_en,
              name_vi,
              total_vocab: 0, // ban đầu = 0, trigger sẽ tự tăng
            })
            .select("id")
            .single();

          if (insertErr) throw insertErr;
          topicId = newTopic.id;
        }

        // 🧩 Tạo liên kết giữa vocab và topic (trigger sẽ tự tăng total_vocab)
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
            `🔁 Relation already exists for vocabId=${vocab.id}, topicId=${topicId}`
          );
        }
      }

      // ✅ Cập nhật trạng thái created = true
      const { error: updateErr } = await supabase
        .from("personalVocab")
        .update({ created: true })
        .eq("id", vocab.id);

      if (updateErr) throw updateErr;
    }
    return { success: true, message: "Gán topic cho từ vựng thành công." };
  },
};
