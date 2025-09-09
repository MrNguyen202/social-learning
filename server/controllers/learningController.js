const learningService = require('../services/learning/learningService');

const learningController = {
    // Get type exercises by slug
    getTypeExercisesBySlug: async (req, res) => {
        const { slug } = req.params;
        try {
            const data = await learningService.getTypeExercisesBySlug(slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching type exercises:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get all level by type_exercise
    getAllLevelsByTypeExercise: async (req, res) => {
        const { type_exercise_id } = req.params;
        try {
            const data = await learningService.getAllLevelsByTypeExercise(type_exercise_id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching levels by type exercise:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get all topic by type_exercise
    getAllTopicsByTypeExercise: async (req, res) => {
        const { type_exercise_id } = req.params;
        try {
            const data = await learningService.getAllTopicsByTypeExercise(type_exercise_id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching topics by type exercise:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get list writing-paragraphs by type_exercise, level and type_paragraph
    getListWritingParagraphsByTypeLevelTypeParagraphs: async (req, res) => {
        const { type_exercise_slug, level_slug, type_paragraph_slug } = req.params;
        try {
            const data = await learningService.getListWritingParagraphsByTypeLevelTypeParagraph(type_exercise_slug, level_slug, type_paragraph_slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching writing paragraphs by type, level and type_paragraph:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get writing-paragraph by id
    getWritingParagraphById: async (req, res) => {
        const { id } = req.params;
        try {
            const data = await learningService.getWritingParagraphById(id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching writing paragraph by id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get all levels
    getAllLevels: async (req, res) => {
        try {
            const data = await learningService.getAllLevels();
            res.json(data);
        } catch (error) {
            console.error("Error fetching all levels:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get all type paragraphs
    getAllTypeParagraphs: async (req, res) => {
        try {
            const data = await learningService.getAllTypeParagraphs();
            res.json(data);
        } catch (error) {
            console.error("Error fetching all type paragraphs:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get all topics
    getAllTopics: async (req, res) => {
        try {
            const data = await learningService.getAllTopics();
            res.json(data);
        } catch (error) {
            console.error("Error fetching all topics:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = learningController;
