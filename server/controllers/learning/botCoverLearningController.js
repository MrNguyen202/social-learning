const botCoverLearningService = require("../../services/learning/botCoverLearningService");
const learningService = require("../../services/learning/learningService");
const promptGenerateParagraph = require("../../utils/prompt/generateParagraph");
const promptGenerateListening = require("../../utils/prompt/generateListening");
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const writingService = require("../../services/learning/writingService");
const promptGiveFeedbackWritingParagraph = require('../../utils/prompt/feedbackAIExParagraph');
const userService = require("../../services/userService");
const scoreUserService = require("../../services/learning/scoreUserService");

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const botCoverLearningController = {
    // Generate paragraph exercise lưu vào bảng writingParagraphs
    createGenerateParagraphExercise: async (req, res) => {
        const { level_slug, type_paragraph_slug } = req.body;

        if (!level_slug || !type_paragraph_slug) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Lấy type_exercise_id
        const typeExerciseData = await learningService.getTypeExercisesBySlug("writing-paragraph");

        // Lấy thông tin level từ Supabase
        const level = await learningService.getLevelBySlug(level_slug);
        if (!level) {
            return res.status(400).json({ error: "Invalid level_slug" });
        }

        // Lấy thông tin type_paragraph từ Supabase
        const typeParagraph = await learningService.getTypeParagraphBySlug(type_paragraph_slug);
        if (!typeParagraph) {
            return res.status(400).json({ error: "Invalid type_paragraph_slug" });
        }

        // Lấy danh sách topics từ Supabase
        const topics = await learningService.getAllTopics();

        const prompt = promptGenerateParagraph(level.name_vi, typeParagraph.name_vi, topics.map(topic => topic.name_vi));

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
                topic_id: topics.find(topic => topic.name_vi === json.topic)?.id || null,
                type_paragraph_id: typeParagraph.id,
                number_sentence: json.number_of_sentences
            };

            const resultSave = await botCoverLearningService.createParagraphExercise(data);

            res.json({ message: "Tạo đoạn văn bản thành công", data: resultSave[0] });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Lỗi khi gọi Gemini API', raw: err.message });
        }
    },

    // Generate listening exercise lưu vào bảng listeningExercises
    createGenerateListeningExercise: async (req, res) => {
        const { level_slug, topic_slug } = req.body;

        if (!level_slug || !topic_slug) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Lấy thông tin level từ Supabase
        const level = await learningService.getLevelBySlug(level_slug);
        if (!level) {
            return res.status(400).json({ error: "Invalid level_slug" });
        }
        // Lấy thông tin topic từ Supabase
        const topic = await learningService.getTopicBySlug(topic_slug);
        if (!topic) {
            return res.status(400).json({ error: "Invalid topic_slug" });
        }

        // Prompt để gọi Gemini
        const prompt = promptGenerateListening(level.name, topic.name);

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

            // Lưu bài tập nghe vào Supabase
            const data = {
                title: json.title,
                text_content: json.text_content,
                word_hiddens: json.word_hiddens // Mảng các từ bị ẩn
                    ? json.word_hiddens.map(word => word.trim()).filter(word => word.length > 0)
                    : [],
                level_id: level.id,
                topic_id: topic.id
            };

            const resultSave = await botCoverLearningService.createListeningExercise(data);

            res.json({ message: "Tạo bài tập nghe thành công", data: resultSave.data });
        } catch (error) {
            console.error("Error generating content:", error);
            return res.status(500).json({ error: "Error generating content" });
        }
    },

    // Feedback writing paragraph exercise
    feedbackWritingParagraphExercise: async (req, res) => {
        const { user_id, paragraph_id, content_submit } = req.body;
        if (!user_id || !paragraph_id || !content_submit) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Lấy thông tin bài tập gốc
        const paragraph = await writingService.getWritingParagraphById(paragraph_id);
        if (!paragraph) {
            console.error("Invalid paragraph_id:", paragraph_id);
            return res.status(400).json({ error: "Invalid paragraph_id" });
        }

        const prompt = promptGiveFeedbackWritingParagraph(paragraph.content_vi, paragraph.content_en, content_submit);

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

            // cập nhật lại number_snowflake
            await scoreUserService.deductSnowflakeFromUser(user_id, -2);
            
            return res.json({ data: json });
        } catch (error) {
            console.error("Error fetching writing paragraph feedback:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = botCoverLearningController;