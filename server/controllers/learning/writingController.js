const writingService = require("../../services/learning/writingService");
const botCoverLearningService = require("../../services/learning/botCoverLearningService");
const promptGiveFeedbackWritingParagraph = require("../../utils/prompt/feedbackAIExParagraph");
const learningService = require("../../services/learning/learningService");
const vocabularyService = require("../../services/learning/vocabularyService");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const scoreUserService = require("../../services/learning/scoreUserService");
const { calculateScore } = require("../../utils/score/calculateScore");
const { calculateSnowflake } = require("../../utils/score/calculateSnowflake");

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const writingController = {
  // Get list writing-paragraphs by type_exercise, level and type_paragraph
  getListWritingParagraphsByTypeLevelTypeParagraphs: async (req, res) => {
    const { type_exercise_slug, level_slug, type_paragraph_slug } = req.params;
    try {
      const data =
        await writingService.getListWritingParagraphsByTypeLevelTypeParagraph(
          type_exercise_slug,
          level_slug,
          type_paragraph_slug
        );
      res.json(data);
    } catch (error) {
      console.error(
        "Error fetching writing paragraphs by type, level and type_paragraph:",
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get writing-paragraph by id
  getWritingParagraphById: async (req, res) => {
    const { id } = req.params;
    try {
      const data = await writingService.getWritingParagraphById(id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching writing paragraph by id:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Submit writing-paragraph exercise
  submitWritingParagraphExercise: async (req, res) => {
    const { user_id, paragraph_id, content_submit } = req.body;

    if (!user_id || !paragraph_id || !content_submit) {
      console.error("Missing required fields in request body");
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

    // Lấy prompt để gửi cho Gemini
    const prompt = promptGiveFeedbackWritingParagraph(
      paragraph.content_vi,
      paragraph.content_en,
      content_submit
    );

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

      // Lưu feedback vào Supabase
      const data = {
        score: json.score,
        accuracy: json.accuracy,
        strengths: json.strengths,
        errors: json.errors,
        comment: json.comment,
      };

      // Lấy danh sách highlight hợp lệ
      const highlights =
        json?.errors
          ?.filter(
            (err) =>
              ["vocabulary", "spelling"].includes(err.error_type) &&
              err.highlight
          )
          ?.map((err) => err.highlight) ?? [];

      // Xử lý từng highlight
      for (const highlight of highlights) {
        const match = highlight.match(/\[(.*?)\]/); // chỉ lấy từ đầu tiên trong []
        if (!match) continue; // bỏ qua nếu không có ngoặc vuông

        const word = match[1]?.trim();
        if (!word) continue;

        await vocabularyService.insertOrUpdateVocabulary(user_id, {
          word,
          error_type: "vocabulary",
          skill: "writing",
        });
      }

      const savedFeedback = await botCoverLearningService.saveWritingFeedback(
        data
      );

      // Lưu submit bài tập
      const submitData = {
        user_id,
        exParagraph_id: paragraph_id,
        content_submit,
        feedback_id: savedFeedback[0].id,
        submit_date: new Date().toISOString(),
      };

      const savedSubmit = await writingService.submitWritingParagraphExercise(
        submitData
      );
      if (!savedSubmit) {
        console.error("Error saving writing paragraph submit:", savedSubmit);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Cập nhật hoặc tạo mới progress
      const progressData = await writingService.getProgressWritingParagraph(
        user_id,
        paragraph_id
      );

      // Tính điểm cho bài viết
      const level = await learningService.getLevelById(paragraph.level_id);
      if (!level) {
        console.error("Error fetching level for paragraph:", paragraph);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const score = calculateScore(
        level.slug === "beginner"
          ? 10
          : level.slug === "intermediate"
          ? 20
          : 30,
        savedFeedback[0].accuracy === 100,
        progressData ? progressData.submit_times : 0,
        progressData ? progressData.isCorrect : false
      );
      // Cộng điểm cho user
      if (score > 0) {
        await scoreUserService.addSkillScore(user_id, "writing", score);
      }

      // Tính bông tuyết cho user
      const snowflakeScore = calculateSnowflake(
        level.slug === "beginner" ? 1 : level.slug === "intermediate" ? 2 : 3,
        savedFeedback[0].accuracy === 100,
        progressData ? progressData.submit_times : 0,
        progressData ? progressData.isCorrect : false
      );

      if (snowflakeScore > 0) {
        await scoreUserService.deductSnowflakeFromUser(user_id, snowflakeScore);
      }

      if (progressData) {
        // Cập nhật progress
        const dataNew = {
          lastSubmit_id: savedSubmit[0].id,
          submit_times: progressData.submit_times + 1,
          isCorrect:
            progressData.isCorrect || savedFeedback[0].accuracy === 100,
        };
        await writingService.updateProgressWritingParagraph(
          user_id,
          paragraph_id,
          dataNew
        );
      } else {
        // Tạo mới progress
        const dataNew = {
          user_id,
          writingParagraph_id: paragraph_id,
          lastSubmit_id: savedSubmit[0].id,
          submit_times: 1,
          isCorrect: savedFeedback[0].accuracy === 100 ? true : false,
        };
        await writingService.saveProgressWritingParagraph(dataNew);
      }

      return res.json({
        data: {
          feedback: json,
          submit: savedSubmit[0],
          score: score,
          snowflake: snowflakeScore,
        },
      });
    } catch (error) {
      console.error("Error submitting writing paragraph exercise:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Lấy progress bài tập writingParagraph của user
  getProgressWritingParagraph: async (req, res) => {
    const { user_id, paragraph_id } = req.params;
    try {
      const progress = await writingService.getProgressWritingParagraph(
        user_id,
        paragraph_id
      );
      res.json(progress);
    } catch (error) {
      console.error("Error fetching writing progress:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get history submit writingParagraph exercise by user_id and paragraph_id with feedback information
  getHistorySubmitWritingParagraphByUserAndParagraph: async (req, res) => {
    const { user_id, paragraph_id } = req.params;
    try {
      const data = await writingService.getAllHistorySubmitWritingParagraph(
        user_id,
        paragraph_id
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching history submit writing paragraph:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = writingController;
