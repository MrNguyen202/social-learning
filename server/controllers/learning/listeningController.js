const { supabase } = require("../../lib/supabase");
const learningService = require("../../services/learning/learningService");
const listeningService = require("../../services/learning/listeningService");
const scoreUserService = require("../../services/learning/scoreUserService");
const vocabularyService = require("../../services/learning/vocabularyService");
const { calculateScore } = require("../../utils/score/calculateScore");
const { calculateSnowflake } = require("../../utils/score/calculateSnowflake");

const listeningController = {
  // Get listening exercise by id
  async getListeningExerciseById(req, res) {
    const { id } = req.params;
    try {
      const data = await listeningService.getListeningExerciseById(id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching listening exercise by id:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get all listening exercises by level_slug and topic_slug
  async getListeningExercises(req, res) {
    const { level_slug, topic_slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const userId = req.user.id;

    try {
      const data = await listeningService.getListeningExercises(
        level_slug,
        topic_slug,
        page,
        limit,
        userId // Truyền userId vào service
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching listening exercises:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Submit listening exercise results
  async submitListeningResults(req, res) {
    // wordAnswers ở đây giờ chỉ chứa các từ ĐÃ ĐIỀN
    const { user_id, ex_listen_id, wordAnswers } = req.body;

    if (!user_id || !ex_listen_id || !Array.isArray(wordAnswers)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Lấy thông tin bài tập nghe gốc từ DB để biết TỔNG SỐ CÂU HỎI
    const listeningExercise = await listeningService.getListeningExerciseById(
      ex_listen_id
    );
    if (!listeningExercise) {
      return res.status(400).json({ error: "Invalid ex_listen_id" });
    }

    try {
      // Tạo submission record
      const resultSubmission = await listeningService.submitListeningResults(
        user_id,
        ex_listen_id
      );

      // 1. CHỈ LƯU NHỮNG TỪ CÓ DỮ LIỆU (Tối ưu Database)
      // (Dù frontend đã lọc, backend vẫn nên check lại để an toàn)
      const answersToSave = wordAnswers.filter(a => a.answer_input && a.answer_input.trim() !== "");

      for (const answer of answersToSave) {
        const data = {
          word_hidden_id: answer.word_hidden_id,
          answer_input: answer.answer_input,
          is_correct: answer.is_correct,
          submit_id: resultSubmission.id,
        };

        // Xử lý logic từ vựng (mastery / misspelling)
        try {
          if (answer.is_correct) {
            await vocabularyService.updateMasteryScoreRPC(
              user_id,
              answer.answer
            );
          } else {
            const temp = {
              word: answer.answer,
              error_type: "Misspelling",
              skill: "listening",
            };
            await vocabularyService.insertOrUpdateVocabulary(user_id, temp);
          }
        } catch (error) {
          console.error("Error processing vocabulary logic:", error);
        }

        // Lưu vào bảng wordAnswer
        await listeningService.saveWordAnswers(data);
      }

      // --- LOGIC TÍNH ĐIỂM MỚI ---

      // Tính số câu đúng dựa trên dữ liệu gửi lên
      const correctCount = wordAnswers.filter((ans) => ans.is_correct).length;

      // Tổng số câu hỏi thực tế (lấy từ DB exercise gốc, không lấy từ mảng gửi lên)
      const totalCount = listeningExercise.wordHidden.length; // Quan trọng

      // Kiểm tra hoàn thành xuất sắc (phải làm đúng TẤT CẢ các từ)
      const isPerfect = correctCount === totalCount;

      // Lấy level để tính hệ số điểm
      const levelListening = await learningService.getLevelById(
        listeningExercise.level_id
      );

      // Lấy progress cũ
      const progress = await listeningService.getUserProgress(
        user_id,
        ex_listen_id
      );

      const hasUsedSuggestion = progress ? progress.is_used_suggestion : false;
      const alreadyCorrectBefore = progress ? progress.isCorrect : false;
      const previousSubmitTimes = progress ? progress.submit_times : 0;

      // Tính điểm (dùng biến isPerfect mới)
      const scoreSubmit = calculateScore(
        levelListening.slug === "beginner" ? 10 : levelListening.slug === "intermediate" ? 20 : 30,
        isPerfect,
        previousSubmitTimes,
        alreadyCorrectBefore
      );

      // Cộng điểm kỹ năng
      if (!hasUsedSuggestion && scoreSubmit > 0) {
        await scoreUserService.addSkillScore(user_id, "listening", scoreSubmit);
        console.log(`Added ${scoreSubmit} points to user ${user_id}`);
      }

      // Tính bông tuyết
      const snowflakeScore = calculateSnowflake(
        levelListening.slug === "beginner" ? 1 : levelListening.slug === "intermediate" ? 2 : 3,
        isPerfect,
        previousSubmitTimes,
        alreadyCorrectBefore
      );

      // Cộng điểm bông tuyết
      if (!hasUsedSuggestion && snowflakeScore > 0) {
        await scoreUserService.deductSnowflakeFromUser(user_id, snowflakeScore);
      }

      // Logic cập nhật Progress
      // Lưu ý: number_word_completed phải so sánh với cái cũ
      const currentCompleted = correctCount;
      const oldCompleted = progress ? progress.number_word_completed : 0;
      const maxCompleted = currentCompleted > oldCompleted ? currentCompleted : oldCompleted;

      const progressData = {
        number_word_completed: maxCompleted,
        lastSubmit: resultSubmission.id,
        completed_date: isPerfect ? new Date() : null,
        submit_times: (progress ? progress.submit_times : 0) + 1,
        score: (progress ? progress.score : 0) + (progress && progress.is_used_suggestion ? 0 : scoreSubmit),
        isCorrect: (progress ? progress.isCorrect : false) || isPerfect,
      };

      if (progress) {
        await listeningService.updateUserProgress(user_id, ex_listen_id, progressData);
      } else {
        await listeningService.createUserProgress({
          user_id,
          listen_para_id: ex_listen_id,
          ...progressData,
        });
      }

      res.json({
        message: "Listening results submitted successfully",
        score: progress && progress.is_used_suggestion ? 0 : scoreSubmit,
        snowflake: progress && progress.is_used_suggestion ? 0 : snowflakeScore,
        correctCount,
        totalCount,
      });
    } catch (error) {
      console.error("Error submitting listening results:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get progress of a user for a specific listening exercise
  async getUserProgress(req, res) {
    const { user_id, listen_para_id } = req.params;
    try {
      const data = await listeningService.getUserProgress(
        user_id,
        listen_para_id
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get history of submissions for a user and a specific listening exercise
  async getSubmissionHistory(req, res) {
    const { user_id, ex_listen_id } = req.params;
    try {
      const data = await listeningService.getAllHistorySubmitListeningByUser(
        user_id,
        ex_listen_id
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching submission history:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // penalty listening exercise
  async penaltyListeningExercise(req, res) {
    const { ex_listen_id } = req.body;
    const userId = req.user.id;
    try {
      // Kiểm tra progress hiện tại
      const progress = await listeningService.getUserProgress(
        userId,
        ex_listen_id
      );

      if (progress) {
        if (progress.is_used_suggestion) {
          return res.json({ message: "Suggestion already used for this exercise." });
        }
        // Cập nhật trạng thái đã dùng gợi ý
        await listeningService.updateUserProgress(userId, ex_listen_id, {
          is_used_suggestion: true,
        });
      } else {
        // Tạo mới progress với trạng thái đã dùng gợi ý
        await listeningService.createUserProgress({
          user_id: userId,
          listen_para_id: ex_listen_id,
          number_word_completed: 0,
          submit_times: 0,
          score: 0,
          isCorrect: false,
          is_used_suggestion: true,
        });
      }
      res.json({ message: "Penalty applied successfully" });
    } catch (error) {
      console.error("Error applying penalty to listening exercise:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = listeningController;
