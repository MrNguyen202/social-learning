const writingService = require('../../services/learning/writingService');

const writingController = {
    // Get list writing-paragraphs by type_exercise, level and type_paragraph
    getListWritingParagraphsByTypeLevelTypeParagraphs: async (req, res) => {
        const { type_exercise_slug, level_slug, type_paragraph_slug } = req.params;
        try {
            const data = await writingService.getListWritingParagraphsByTypeLevelTypeParagraph(type_exercise_slug, level_slug, type_paragraph_slug);
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
            const data = await writingService.getWritingParagraphById(id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching writing paragraph by id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = writingController;