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
};

module.exports = vocabularyController;
