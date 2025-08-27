const learningService = require('../services/learningService');

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

    // Get list writing-exercises by type_exercise, level and topic
    getListWritingExercisesByTypeLevelTopic: async (req, res) => {
        const { type_exercise_slug, level_slug, topic_slug } = req.params;
        try {
            const data = await learningService.getListWritingExercisesByTypeLevelTopic(type_exercise_slug, level_slug, topic_slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching writing exercises by type, level and topic:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get writing-exercise by id
    getWritingExerciseById: async (req, res) => {
        const { id } = req.params;
        try {
            const data = await learningService.getWritingExerciseById(id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching writing exercise by id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = learningController;
