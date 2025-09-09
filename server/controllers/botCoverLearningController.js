const botCoverLearningService = require("../services/botCoverLearningService");
const learningService = require("../services/learning/learningService");
const promptGenerateParagraph = require("../utils/prompt/generateParagraph");
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const botCoverLearningController = {
    // Generate paragraph exercise lưu vào bảng writingParagraphs
    createGenerateParagraphExercise: async (req, res) => {
        const { level_id, type_paragraph } = req.body;

        if (!level_id || !type_paragraph) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Lấy type_exercise_id
        const typeExerciseData = await learningService.getTypeExercisesBySlug("writing-paragraph");

        // Lấy thông tin level từ Supabase
        const level = await learningService.getLevelById(level_id);
        if (!level) {
            return res.status(400).json({ error: "Invalid level_id" });
        }

        // Lấy thông tin type_paragraph từ Supabase
        const typeParagraph = await learningService.getTypeParagraphById(type_paragraph);
        if (!typeParagraph) {
            return res.status(400).json({ error: "Invalid type_paragraph" });
        }

        // Lấy danh sách topics từ Supabase
        const topics = await learningService.getAllTopics();

        const prompt = promptGenerateParagraph(level.name, typeParagraph.name, topics.map(topic => topic.name));

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(prompt);

            const text = result.response.text();
            // Lọc JSON thuần từ Gemini
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) {
                return res.status(500).json({ error: "Gemini không trả JSON hợp lệ", raw: text });
            }

            const json = JSON.parse(match[0]);

            // Lưu đoạn văn bản vào Supabase
            // Custom data để phù hợp với cấu trúc bảng
            const data = {
                content_vi: json.content_vi,
                content_en: json.content_en,
                title: json.title,
                level_id: level.id,
                type_exercise_id: typeExerciseData.id,
                topic_id: topics.find(topic => topic.name === json.topic)?.id || null,
                type_paragraph_id: typeParagraph.id,
                number_sentence: json.number_of_sentences
            };

            const resultSave = await botCoverLearningService.createParagraphExercise(data);

            res.json({ paragraph: resultSave });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Lỗi khi gọi Gemini API', raw: err.message });
        }
    }
};

module.exports = botCoverLearningController;