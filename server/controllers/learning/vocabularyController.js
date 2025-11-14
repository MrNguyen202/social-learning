const vocabularyService = require("../../services/learning/vocabularyService");

const vocabularyController = {
  async insertOrUpdateVocabulary(req, res) {
    const { userId, vocabData } = req.body;
    if (!userId || !vocabData) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.insertOrUpdateVocabulary(
        userId,
        vocabData
      );
      if (error) {
        return res.status(500).json({ error: "Error inserting vocabulary" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in insertVocabulary:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async deleteVocabularyErrors(req, res) {
    const { userId, word } = req.body;
    if (!userId || !word) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.deleteVocabularyErrors(
        userId,
        word
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error deleting vocabulary errors" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in deleteVocabularyErrors:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getListPersonalVocabByUserIdAndErrorCount(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } =
        await vocabularyService.getListPersonalVocabByUserIdAndErrorCount(
          userId
        );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching personal vocabulary list" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error(
        "Error in getListPersonalVocabByUserIdAndErrorCount:",
        error
      );
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getListPersonalVocabByUserIdAndRelatedWord(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } =
        await vocabularyService.getListPersonalVocabByUserIdAndRelatedWord(
          userId
        );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching personal vocabulary list" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error(
        "Error in getListPersonalVocabByUserIdAndRelatedWord:",
        error
      );
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getListPersonalVocabByUserIdAndCreated(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } =
        await vocabularyService.getListPersonalVocabByUserIdAndCreated(userId);
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching personal vocabulary list" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getListPersonalVocabByUserIdAndCreated:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getPersonalVocabById(req, res) {
    const { personalVocabId } = req.params;
    if (!personalVocabId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.getPersonalVocabById(
        personalVocabId
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching personal vocabulary by ID" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getPersonalVocabById:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getSumPersonalVocabByMasteryScore(req, res) {
    const { userId, from, to } = req.params;
    if (!userId || from === undefined || to === undefined) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, total, error } =
        await vocabularyService.getSumPersonalVocabByMasteryScore(
          userId,
          parseInt(from),
          parseInt(to)
        );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching sum of personal vocabulary" });
      }
      return res.status(200).json({ success: true, data, total });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getPersonalVocabAllTopic(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.getPersonalVocabAllTopic(
        userId
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching personal vocabulary topics" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getPersonalVocabAllTopic:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getPersonalVocabByTopic(req, res) {
    const { userId, topic } = req.params;
    if (!userId || !topic) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.getPersonalVocabByTopic(
        userId,
        topic
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching personal vocabulary by topic" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getPersonalVocabByTopic:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getUserTopics(req, res) {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    try {
      const { data, error } = await vocabularyService.getUserTopics(userId);
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching user vocabulary topics" });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getUserTopics:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getVocabByTopic(req, res) {
    const { userId, topicId } = req.params;

    if (!userId || !topicId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    try {
      const { data, name_en, name_vi, error } =
        await vocabularyService.getVocabByTopic(userId, topicId);
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching vocabulary by topic" });
      }

      return res.status(200).json({ success: true, data, name_en, name_vi });
    } catch (error) {
      console.error("Error in getVocabByTopic:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async updateMasteryScoreRPC(req, res) {
    const { userId, word } = req.body;

    if (!userId || !word) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.updateMasteryScoreRPC(
        userId,
        word
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error updating mastery score via RPC" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in updateMasteryScoreRPC:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async archiveMasteredWordRPC(req, res) {
    const { personalVocabId } = req.body;

    if (!personalVocabId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.archiveMasteredWordRPC(
        personalVocabId
      );
      if (error) {
        return res

          .status(500)
          .json({ error: "Error archiving mastered word via RPC" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in archiveMasteredWordRPC:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async resetReviewWordRPC(req, res) {
    const { personalVocabId } = req.body;
    if (!personalVocabId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.resetReviewWordRPC(
        personalVocabId
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error resetting review word via RPC" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in resetReviewWordRPC:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async deletePersonalVocabRPC(req, res) {
    const { personalVocabId } = req.body;
    if (!personalVocabId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.deletePersonalVocabRPC(
        personalVocabId
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error deleting personal vocab via RPC" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in deletePersonalVocabRPC:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async deleteUserVocabErrorsRPC(req, res) {
    const { userId, word } = req.body;
    if (!userId || !word) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } = await vocabularyService.deleteUserVocabErrorsRPC(
        userId,
        word
      );
      if (error) {
        return res
          .status(500)
          .json({ error: "Error deleting user vocab errors via RPC" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in deleteUserVocabErrorsRPC:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getVocabDetailsForReviewRPC(req, res) {
    const { personalVocabId } = req.params;
    if (!personalVocabId) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const { data, error } =
        await vocabularyService.getVocabDetailsForReviewRPC(personalVocabId);
      if (error) {
        return res
          .status(500)
          .json({ error: "Error fetching vocab details for review via RPC" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getVocabDetailsForReviewRPC:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = vocabularyController;
