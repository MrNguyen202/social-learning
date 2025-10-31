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
    try {
      const data = await listeningService.getListeningExercises(
        level_slug,
        topic_slug
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching listening exercises:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Submit listening exercise results
  async submitListeningResults(req, res) {
    const { user_id, ex_listen_id, wordAnswers } = req.body;

    if (!user_id || !ex_listen_id || !Array.isArray(wordAnswers)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Lấy thông tin bài tập nghe
    const listeningExercise = await listeningService.getListeningExerciseById(
      ex_listen_id
    );
    if (!listeningExercise) {
      return res.status(400).json({ error: "Invalid ex_listen_id" });
    }

    try {
      // Create submission record
      const resultSubmission = await listeningService.submitListeningResults(
        user_id,
        ex_listen_id
      );
      if (!resultSubmission) {
        return res
          .status(500)
          .json({ error: "Failed to create submission record" });
      }

      // Lập qua mang wordAnswers để save tung cai mot
      for (const answer of wordAnswers) {
        const data = {
          word_hidden_id: answer.word_hidden_id,
          answer_input: answer.answer_input,
          is_correct: answer.is_correct,
          submit_id: resultSubmission.id,
        };

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
          console.error("Error processing answer:", error);
        }
        await listeningService.saveWordAnswers(data);
      }

      // Cập nhật lại progress
      const progress = await listeningService.getUserProgress(
        user_id,
        ex_listen_id
      );
      const levelListening = await learningService.getLevelById(
        listeningExercise.level_id
      );

      // Tính điểm
      const scoreSubmit = calculateScore(
        levelListening.slug === "beginner"
          ? 10
          : levelListening.slug === "intermediate"
          ? 20
          : 30,
        wordAnswers.every((ans) => ans.is_correct),
        progress ? progress.submit_times : 0,
        progress ? progress.isCorrect : false
      );

      // Cộng điểm cho user
      if (scoreSubmit > 0) {
        await scoreUserService.addSkillScore(user_id, "listening", scoreSubmit);
      }

      // Tính bông tuyết cho user
      const snowflakeScore = calculateSnowflake(
        levelListening.slug === "beginner"
          ? 1
          : levelListening.slug === "intermediate"
          ? 2
          : 3,
        wordAnswers.every((ans) => ans.is_correct),
        progress ? progress.submit_times : 0,
        progress ? progress.isCorrect : false
      );

      // Cộng bông tuyết cho user
      if (snowflakeScore > 0) {
        await scoreUserService.deductSnowflakeFromUser(user_id, snowflakeScore);
      }

      if (progress) {
        // Cập nhật progress nếu cần thiết
        const updatedProgressData = {
          user_id,
          listen_para_id: ex_listen_id,
          number_word_completed:
            wordAnswers.filter((ans) => ans.is_correct).length >
            progress.number_word_completed
              ? wordAnswers.filter((ans) => ans.is_correct).length
              : progress.number_word_completed,
          lastSubmit: resultSubmission.id,
          completed_date: wordAnswers.every((ans) => ans.is_correct)
            ? new Date()
            : null,
          submit_times: progress.submit_times + 1,
          score: progress.score + scoreSubmit,
          isCorrect:
            progress.isCorrect || wordAnswers.every((ans) => ans.is_correct),
        };
        await listeningService.updateUserProgress(updatedProgressData);
      } else {
        // Tạo mới progress nếu chưa có
        const newProgressData = {
          user_id,
          listen_para_id: ex_listen_id,
          number_word_completed: wordAnswers.filter((ans) => ans.is_correct)
            .length,
          lastSubmit: resultSubmission.id,
          completed_date: wordAnswers.every((ans) => ans.is_correct)
            ? new Date()
            : null,
          submit_times: 1,
          score: scoreSubmit,
          isCorrect: wordAnswers.every((ans) => ans.is_correct),
        };
        await listeningService.createUserProgress(newProgressData);
      }

      const correctCount = wordAnswers.filter((w) => w.is_correct).length;
      const totalCount = wordAnswers.length;

      res.json({
        message: "Listening results submitted successfully",
        score: scoreSubmit,
        snowflake: snowflakeScore,
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
};

module.exports = listeningController;
