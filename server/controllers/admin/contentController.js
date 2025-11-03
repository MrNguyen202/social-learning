const contentService = require("../../services/admin/contentService");

// Hàm trợ giúp để parse ID an toàn
const parseIntParam = (param) => {
  const id = parseInt(param, 10);
  return isNaN(id) ? null : id;
};

const contentController = {
  // ====== GET ======

  loadListeningParagraphs: async (req, res) => {
    try {
      const { levelId, topicId } = req.query;
      const { data, error } = await contentService.loadListeningParagraphs({
        levelId: parseIntParam(levelId),
        topicId: parseIntParam(topicId),
      });
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  loadWritingExercises: async (req, res) => {
    try {
      const { levelId, topicId, typeExerciseId, typeParagraphId } = req.query;
      const { data, error } = await contentService.loadWritingExercises({
        levelId: parseIntParam(levelId),
        topicId: parseIntParam(topicId),
        typeExerciseId: parseIntParam(typeExerciseId),
        typeParagraphId: parseIntParam(typeParagraphId),
      });
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  loadSpeakingLessons: async (req, res) => {
    try {
      const { levelId, topicId } = req.query;
      const { data, error } = await contentService.loadSpeakingLessons({
        levelId: parseIntParam(levelId),
        topicId: parseIntParam(topicId),
      });
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  loadTopics: async (req, res) => {
    try {
      const { data, error } = await contentService.loadTopics();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  loadLevels: async (req, res) => {
    try {
      const { data, error } = await contentService.loadLevels();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  loadTypeExercises: async (req, res) => {
    try {
      const { data, error } = await contentService.loadTypeExercises();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  loadTypeParagraphs: async (req, res) => {
    try {
      const { data, error } = await contentService.loadTypeParagraphs();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ====== POST (CREATE) ======

  createListeningParagraph: async (req, res) => {
    try {
      const { data, error } = await contentService.createListeningParagraph(
        req.body
      );
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  createSpeakingLesson: async (req, res) => {
    try {
      const { data, error } = await contentService.createSpeakingLesson(
        req.body
      );
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  createWritingExercise: async (req, res) => {
    try {
      const { data, error } = await contentService.createWritingExercise(
        req.body
      );
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ====== (UPDATE) ======

  updateListeningParagraph: async (req, res) => {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null)
        return res.status(400).json({ success: false, message: "Invalid ID" });
      const { data, error } = await contentService.updateListeningParagraph(
        id,
        req.body
      );
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateWritingExercise: async (req, res) => {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null)
        return res.status(400).json({ success: false, message: "Invalid ID" });
      const { data, error } = await contentService.updateWritingExercise(
        id,
        req.body
      );
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ====== DELETE ======

  deleteListeningParagraph: async (req, res) => {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null)
        return res.status(400).json({ success: false, message: "Invalid ID" });
      await contentService.deleteListeningParagraph(id);
      return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteSpeakingLesson: async (req, res) => {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null)
        return res.status(400).json({ success: false, message: "Invalid ID" });
      await contentService.deleteSpeakingLesson(id);
      return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteWritingExercise: async (req, res) => {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null)
        return res.status(400).json({ success: false, message: "Invalid ID" });
      await contentService.deleteWritingExercise(id);
      return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = contentController;
