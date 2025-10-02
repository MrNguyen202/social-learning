const writingService = require('../../services/learning/writingService');
const botCoverLearningService = require('../../services/learning/botCoverLearningService');
const promptGiveFeedbackWritingParagraph = require('../../utils/prompt/feedbackAIExParagraph');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // Submit writing-paragraph exercise
    submitWritingParagraphExercise: async (req, res) => {
        const { user_id, paragraph_id, content_submit } = req.body;

        if (!user_id || !paragraph_id || !content_submit) {
            console.error("Missing required fields in request body");
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Lấy thông tin bài tập gốc
        const paragraph = await writingService.getWritingParagraphById(paragraph_id);
        if (!paragraph) {
            console.error("Invalid paragraph_id:", paragraph_id);
            return res.status(400).json({ error: "Invalid paragraph_id" });
        }

        // Lấy prompt để gửi cho Gemini
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

            // Lưu feedback vào Supabase
            const data = {
                score: json.score,
                accuracy: json.accuracy,
                strengths: json.strengths,
                errors: json.errors,
                comment: json.comment,
            };

            const savedFeedback = await botCoverLearningService.saveWritingFeedback(data);

            // Lưu submit bài tập
            const submitData = {
                user_id,
                exParagraph_id: paragraph_id,
                content_submit,
                feedback_id: savedFeedback[0].id
            };

            const savedSubmit = await writingService.submitWritingParagraphExercise(submitData);
            if (!savedSubmit) {
                console.error("Error saving writing paragraph submit:", savedSubmit);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            // Cập nhật hoặc tạo mới progress
            const progressData = await writingService.getProgressWritingParagraph(user_id, paragraph_id);
            if (progressData) {
                // Cập nhật progress
                const dataNew = {
                    lastSubmit_id: savedSubmit[0].id,
                    submit_times: progressData.submit_times + 1
                };
                await writingService.updateProgressWritingParagraph(user_id, paragraph_id, dataNew);
            } else {
                // Tạo mới progress
                const dataNew = {
                    user_id,
                    writingParagraph_id: paragraph_id,
                    lastSubmit_id: savedSubmit[0].id,
                    submit_times: 1
                };
                await writingService.saveProgressWritingParagraph(dataNew);
            }

            return res.json({ data: { feedback: json, submit: savedSubmit[0] } });
        } catch (error) {
            console.error("Error submitting writing paragraph exercise:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Lấy progress bài tập writingParagraph của user
    getProgressWritingParagraph: async (req, res) => {
        const { user_id, paragraph_id } = req.params;
        try {
            const progress = await writingService.getProgressWritingParagraph(user_id, paragraph_id);
            console.log("Fetched progress:", progress);
            res.json(progress);
        } catch (error) {
            console.error("Error fetching writing progress:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = writingController;