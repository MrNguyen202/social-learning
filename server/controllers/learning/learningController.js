const learningService = require('../../services/learning/learningService');

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

    // Get leve by slug
    getLevelBySlug: async (req, res) => {
        const { slug } = req.params;
        try {
            const data = await learningService.getLevelBySlug(slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching level by slug:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get topic by slug
    getTopicBySlug: async (req, res) => {
        const { slug } = req.params;
        try {
            const data = await learningService.getTopicBySlug(slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching topic by slug:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get type paragraph by slug
    getTypeParagraphBySlug: async (req, res) => {
        const { slug } = req.params;
        try {
            const data = await learningService.getTypeParagraphBySlug(slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching type paragraph by slug:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get levels by name_vi
    getLevelsByNameVi: async (req, res) => {
        const { name_vi } = req.params;
        try {
            const data = await learningService.getLevelsByNameVi(name_vi);
            res.json(data);
        }
        catch (error) {
            console.error("Error fetching levels by name_vi:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get topics by name_vi
    getTopicsByNameVi: async (req, res) => {
        const { name_vi } = req.params;
        try {
            const data = await learningService.getTopicsByNameVi(name_vi);
            res.json(data);
        }
        catch (error) {
            console.error("Error fetching topics by name_vi:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get type paragraphs by name_vi
    getTypeParagraphsByNameVi: async (req, res) => {
        const { name_vi } = req.params;
        try {
            const data = await learningService.getTypeParagraphsByNameVi(name_vi);
            res.json(data);
        } catch (error) {
            console.error("Error fetching type paragraphs by name_vi:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = learningController;
