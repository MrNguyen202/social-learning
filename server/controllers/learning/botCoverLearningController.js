const botCoverLearningService = require("../../services/learning/botCoverLearningService");
const learningService = require("../../services/learning/learningService");
const promptGenerateParagraph = require("../../utils/prompt/generateParagraph");
const promptGenerateListening = require("../../utils/prompt/generateListening");
const promptGenerateSpeaking = require("../../utils/prompt/generateSpeaking");
const promptGenerateTopicSpeaking = require("../../utils/prompt/generateTopicSpeaking");
const promptGeneratePersonalWord = require("../../utils/prompt/generateVocabulary");
const promptGenerateConversationPractice = require("../../utils/prompt/generateConversationPractice");
const promptGenerateWordsPractice = require("../../utils/prompt/generateWordsPractice");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const writingService = require("../../services/learning/writingService");
const promptGiveFeedbackWritingParagraph = require("../../utils/prompt/feedbackAIExParagraph");
const scoreUserService = require("../../services/learning/scoreUserService");
const topicService = require("../../services/learning/topicService");
const {
  updatePersonalVocab,
} = require("../../services/learning/vocabularyService");
const fs = require("fs");
const wav = require("wav");
const {
  uploadAudioBufferToCloudinary,
} = require("../../services/cloudinaryService");
const vocabularyService = require("../../services/learning/vocabularyService");

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Giọng đọc Anh Mỹ (được đánh giá là rõ, tự nhiên, phổ thông)
const americanVoices = [
  "Kore", // Firm - giọng Mỹ trung tính
  "Fenrir", // Excitable - sôi nổi
  "Aoede", // Breezy - nhẹ nhàng
  "Umbriel", // Easy-going - thân thiện
  "Enceladus", // Breathy - nhẹ
  "Laomedeia", // Upbeat - tươi vui
  "Algieba", // Smooth - tự nhiên
  "Achird", // Friendly - dễ nghe
  "Gacrux", // Mature - giọng người lớn, rõ
  "Sulafat", // Warm - ấm áp
];

// Hàm lưu file WAV từ buffer
async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

// CONTROLLER XỬ LÝ YÊU CẦU
const botCoverLearningController = {
  // Generate paragraph exercise lưu vào bảng writingParagraphs
  createGenerateParagraphExercise: async (req, res) => {
    const { level_slug, type_paragraph_slug } = req.body;
    const userId = req.user.id;

    if (!level_slug || !type_paragraph_slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy type_exercise_id
    const typeExerciseData = await learningService.getTypeExercisesBySlug(
      "writing-paragraph"
    );

    // Lấy thông tin level từ Supabase
    const level = await learningService.getLevelBySlug(level_slug);
    if (!level) {
      return res.status(400).json({ error: "Invalid level_slug" });
    }

    // Lấy thông tin type_paragraph từ Supabase
    const typeParagraph = await learningService.getTypeParagraphBySlug(
      type_paragraph_slug
    );
    if (!typeParagraph) {
      return res.status(400).json({ error: "Invalid type_paragraph_slug" });
    }

    // Lấy danh sách topics từ Supabase
    const topics = await learningService.getAllTopics();

    const prompt = promptGenerateParagraph(
      level.name_vi,
      typeParagraph.name_vi,
      topics.map((topic) => topic.name_vi)
    );

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }

      const json = JSON.parse(match[0]);

      // Lưu đoạn văn bản vào Supabase
      // Custom data để phù hợp với cấu trúc bảng
      const data = {
        content_vi: json.content_vi,
        content_en: json.content_en,
        title_vi: json.title_vi,
        title_en: json.title_en,
        level_id: level.id,
        type_exercise_id: typeExerciseData.id,
        topic_id:
          topics.find((topic) => topic.name_vi === json.topic)?.id || null,
        type_paragraph_id: typeParagraph.id,
        number_sentence: json.number_of_sentences,
        genAI: {
          userId: userId,
          isPublic: false,
        }
      };

      const resultSave = await botCoverLearningService.createParagraphExercise(
        data
      );

      res.json({ message: "Tạo đoạn văn bản thành công", data: resultSave[0] });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ error: "Lỗi khi gọi Gemini API", raw: err.message });
    }
  },

  // Generate listening exercise lưu vào bảng listeningExercises
  createGenerateListeningExercise: async (req, res) => {
    const { level_slug, topic_slug } = req.body;

    if (!level_slug || !topic_slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy thông tin level từ Supabase
    const level = await learningService.getLevelBySlug(level_slug);
    if (!level) {
      return res.status(400).json({ error: "Invalid level_slug" });
    }
    // Lấy thông tin topic từ Supabase
    const topic = await learningService.getTopicBySlug(topic_slug);
    if (!topic) {
      return res.status(400).json({ error: "Invalid topic_slug" });
    }

    // Prompt để gọi Gemini
    const prompt = promptGenerateListening(level.name_vi, topic.name_vi);

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }
      const json = JSON.parse(match[0]);

      const randomVoice =
        americanVoices[Math.floor(Math.random() * americanVoices.length)];

      // gen audio từ text_en
      const audioResponse = await genAI2.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: json.text_content }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: randomVoice },
            },
          },
        },
      });

      // Lấy dữ liệu base64 audio
      const dataAudio =
        audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!dataAudio) {
        return res
          .status(500)
          .json({ error: "Lỗi khi tạo audio từ Gemini TTS" });
      }

      // Giai mã base64 và lưu file tạm thời
      const audioBuffer = Buffer.from(dataAudio, "base64");
      const tempFilePath = `./uploads/tss_${Date.now()}.wav`;
      await saveWaveFile(tempFilePath, audioBuffer);

      // Upload file audio lên Cloudinary
      const uploadResult = await uploadAudioBufferToCloudinary(
        tempFilePath,
        "social-learning/audio-listening"
      );

      // Xoá file tạm
      if (uploadResult.success) {
        fs.unlinkSync(tempFilePath);
      } else {
        console.error(
          "Lỗi khi upload audio lên Cloudinary:",
          uploadResult.error
        );
      }

      // Lưu bài tập nghe vào Supabase
      const data = {
        title_en: json.title_en,
        title_vi: json.title_vi,
        description_en: json.description_en,
        description_vi: json.description_vi,
        text_content: json.text_content,
        audio_url: uploadResult.url,
        word_hiddens: json.word_hiddens // Mảng các từ bị ẩn
          ? json.word_hiddens
              .map((word) => word.trim())
              .filter((word) => word.length > 0)
          : [],
        level_id: level.id,
        topic_id: topic.id,
      };

      const resultSave = await botCoverLearningService.createListeningExercise(
        data
      );

      res.json({
        message: "Tạo bài tập nghe thành công",
        data: resultSave.data,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ error: "Error generating content" });
    }
  },

  // Feedback writing paragraph exercise
  feedbackWritingParagraphExercise: async (req, res) => {
    const { user_id, paragraph_id, content_submit } = req.body;
    if (!user_id || !paragraph_id || !content_submit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy thông tin bài tập gốc
    const paragraph = await writingService.getWritingParagraphById(
      paragraph_id
    );
    if (!paragraph) {
      console.error("Invalid paragraph_id:", paragraph_id);
      return res.status(400).json({ error: "Invalid paragraph_id" });
    }

    const prompt = promptGiveFeedbackWritingParagraph(
      paragraph.content_vi,
      paragraph.content_en,
      content_submit
    );

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }
      const json = JSON.parse(match[0]);

      // cập nhật lại number_snowflake
      await scoreUserService.deductSnowflakeFromUser(user_id, -2);

      return res.json({ data: json });
    } catch (error) {
      console.error("Error fetching writing paragraph feedback:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Generate speaking exercise
  createGenerateSpeakingExercise: async (req, res) => {
    const { level_slug, topic_slug } = req.body;

    if (!level_slug || !topic_slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy thông tin level từ Supabase
    const level = await learningService.getLevelBySlug(level_slug);
    if (!level) {
      return res.status(400).json({ error: "Invalid level_slug" });
    }
    // Lấy thông tin topic từ Supabase
    const topic = await learningService.getTopicBySlug(topic_slug);
    if (!topic) {
      return res.status(400).json({ error: "Invalid topic_slug" });
    }

    // Prompt để gọi Gemini
    const prompt = promptGenerateSpeaking(level.name_vi, topic.name_vi);

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (!jsonMatch) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }

      let json;
      try {
        json = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Lỗi parse JSON:", e);
        return res
          .status(500)
          .json({ error: "Lỗi phân tích JSON", raw: jsonMatch[1] });
      }

      // Lưu bài nói vào data
      const data = json.map((item) => ({
        id: item.id,
        content: item.content,
      }));

      res.json({ message: "Tạo bài tập nói thành công", data });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ error: "Error generating content" });
    }
  },

  // Test Gemini: Generate personal word
  createGeneratePersonalWordByAI: async (req, res) => {
    const { userId, word } = req.body;

    if (!userId || !word) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prompt để gọi Gemini
    const prompt = promptGeneratePersonalWord(word);

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (!jsonMatch) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }

      let json;
      try {
        json = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Lỗi parse JSON:", e);
        return res
          .status(500)
          .json({ error: "Lỗi phân tích JSON", raw: jsonMatch[1] });
      }

      const data = json.words;

      // Lưu từ vựng cá nhân vào data
      const personalVocab = data.map((item) => ({
        id: item.id,
        word: item.word,
        word_vi: item.word_vi,
        meaning: item.meaning,
        meaning_vi: item.meaning_vi,
        example: item.example,
        example_vi: item.example_vi,
        ipa: item.ipa,
        word_type: item.word_type,
      }));

      // Lưu vào mảng jsonb của bảng personalVocab
      const resultSaveVocab = await updatePersonalVocab(
        userId,
        word,
        personalVocab
      );

      if (resultSaveVocab.error) {
        return res.status(500).json({ error: "Lỗi khi lưu từ vựng cá nhân" });
      }

      res.status(200).json({
        success: true,
        message: "Tạo từ vựng cá nhân thành công",
        data,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ error: "Error generating content" });
    }
  },

  createGenerateConversationPracticeByAI: async (req, res) => {
    const { level_slug, topic_slug } = req.body;

    if (!level_slug || !topic_slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy thông tin level từ Supabase
    const level = await learningService.getLevelBySlug(level_slug);
    if (!level) {
      return res.status(400).json({ error: "Invalid level_slug" });
    }

    // Prompt để gọi Gemini
    const prompt = promptGenerateConversationPractice(
      level.name_vi,
      topic_slug
    );

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (!jsonMatch) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }

      let json;
      try {
        json = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Lỗi parse JSON:", e);
        return res
          .status(500)
          .json({ error: "Lỗi phân tích JSON", raw: jsonMatch[1] });
      }

      // Lưu bài nói vào data
      const data = {
        description: json.description,
        content: json.content,
      };

      res.json({ message: "Tạo bài tập nói thành công", data });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ error: "Error generating content" });
    }
  },

  createGenerateWordsPracticeByAI: async (req, res) => {
    const { userId, words } = req.body;

    if (!userId || !words) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prompt để gọi Gemini
    const prompt = promptGenerateWordsPractice(words);

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (!jsonMatch) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }

      let json;
      try {
        json = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Lỗi parse JSON:", e);
        return res
          .status(500)
          .json({ error: "Lỗi phân tích JSON", raw: jsonMatch[1] });
      }

      res.status(200).json({
        success: true,
        message: "Tạo bài tập thành công",
        data: json,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ error: "Error generating content" });
    }
  },

  generateTopicsForUser: async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const checkTopicExists = await topicService.checkUnclassifiedVocab(
        userId
      );

      if (checkTopicExists.count > 0) {
        const result = await topicService.generateTopicsForUser(userId);
        res.status(200).json({ success: true, data: result });
      } else {
        res.status(200).json({
          success: true,
          message: "User has no vocabularies without topics.",
        });
      }
    } catch (error) {
      console.error("Error generating topics:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate speaking exercise
  generateTopicSpeaking: async (req, res) => {
    const { topic_slug } = req.body;

    if (!topic_slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy thông tin topic từ Supabase
    const topic = await learningService.getTopicBySlug(topic_slug);
    if (!topic) {
      return res.status(400).json({ error: "Invalid topic_slug" });
    }

    // Prompt để gọi Gemini
    const prompt = promptGenerateTopicSpeaking(topic.name_vi);

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      // Lọc JSON thuần từ Gemini
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (!jsonMatch) {
        return res
          .status(500)
          .json({ error: "Gemini không trả JSON hợp lệ", raw: text });
      }

      let json;
      try {
        json = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Lỗi parse JSON:", e);
        return res
          .status(500)
          .json({ error: "Lỗi phân tích JSON", raw: jsonMatch[1] });
      }

      res.json({ message: "Tạo bài tập nói thành công", data: json });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ error: "Error generating content" });
    }
  },
};

module.exports = botCoverLearningController;
