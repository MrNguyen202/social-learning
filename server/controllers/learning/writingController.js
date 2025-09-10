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
        const { user_id, paragraph_id, originalVietnamese, originalEnglish } = req.body;

        if (!user_id || !paragraph_id || !originalVietnamese || !originalEnglish) {
            console.error("Missing required fields in request body");
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Lấy thông tin bài tập gốc
        const paragraph = await writingService.getWritingParagraphById(paragraph_id);
        if (!paragraph) {
            console.error("Invalid paragraph_id:", paragraph_id);
            return res.status(400).json({ error: "Invalid paragraph_id" });
        }

        // Lấy progress hiện tại của user về bài tập này
        const progress = await writingService.getProgressWritingParagraph(user_id, paragraph_id);

        // Lấy prompt để gửi cho Gemini
        const prompt = promptGiveFeedbackWritingParagraph(paragraph.content_vi, paragraph.content_en, originalVietnamese, originalEnglish);

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
                accuracy: json.accuracy,
                highlighted: json.highlighted,
                suggestions: json.suggestions,
                comment: json.comment,
                score: json.score,
            };

            const resultSaveFeedback = await botCoverLearningService.saveWritingFeedback(data);

            // Lưu submitWritingParagraph
            const dataSubmit = {
                user_id,
                exParagraph_id: paragraph_id,
                content_vi: originalVietnamese,
                content_submit: originalEnglish,
                feedback_id: resultSaveFeedback[0].id,
                submit_date: new Date().toISOString(),
                index_sentence: progress ? progress.completed_sentences + 1 : 1,
            };
            const resultSubmit = await writingService.submitWritingParagraphExercise(dataSubmit);

            if (resultSaveFeedback && resultSubmit) {
                if (progress === null) {
                    const dataProgress = {
                        user_id,
                        writingParagraph_id: paragraph_id,
                        completed_sentences: resultSaveFeedback[0].accuracy >= 92 ? 1 : 0,
                        status: "progressing",
                        lastSubmit_id: resultSubmit[0].id,
                        total_accuracy: resultSaveFeedback[0].accuracy >= 92 ? 100 : 0,
                        total_point: resultSaveFeedback[0].accuracy >= 92 ? 15 : 0
                    };
                    await writingService.saveProgressWritingParagraph(dataProgress);
                } else {
                    // Nếu đã có progress rồi, không lưu nữa mà chỉ cập nhật
                    const submitTimes = await writingService.countSubmitsForCurrentSentence(user_id, paragraph_id, progress.completed_sentences + 1);
                    // Đếm số lần submit bài tập của user
                    const submitCount = await writingService.countSubmitsWritingParagraph(user_id, paragraph_id);

                    const updatedProgress = {
                        completed_sentences: progress.completed_sentences + (resultSaveFeedback[0].accuracy >= 92 ? 1 : 0),
                        lastSubmit_id: resultSubmit[0].id,
                        total_accuracy: (progress.completed_sentences + (resultSaveFeedback[0].accuracy >= 92 ? 1 : 0)) / (submitCount + (resultSaveFeedback[0].accuracy >= 92 ? 1 : 0)) * 100,
                        total_point: progress.total_point + (resultSaveFeedback[0].accuracy >= 92 ? (submitTimes === 0 ? 15 : submitTimes === 1 ? 10 : submitTimes === 2 ? 5 : 0) : 0),
                        status: (progress.completed_sentences + (resultSaveFeedback[0].accuracy >= 92 ? 1 : 0)) === paragraph.number_sentence ? "completed" : "progressing"
                    };
                    await writingService.updateProgressWritingParagraph(user_id, paragraph_id, updatedProgress);
                }
            }

            res.json({ message: "Submit writing paragraph exercise successfully", feedback: resultSaveFeedback[0], submit: resultSubmit[0] });
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