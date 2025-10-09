const learningService = require("../../services/learning/listeningService");
const listeningService = require("../../services/learning/listeningService");

const listeningController = {
    // Get listening exercise by id
    async getListeningExerciseById(req, res) {
        const { id } = req.params;
        try {
            const data = await learningService.getListeningExerciseById(id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching listening exercise by id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get all listening exercises by level_slug and topic_slug
    async getListeningExercises(req, res) {
        const { level_slug, topic_slug } = req.params;
        try {
            const data = await listeningService.getListeningExercises(level_slug, topic_slug);
            res.json(data);
        } catch (error) {
            console.error("Error fetching listening exercises:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Submit listening exercise results
    async submitListeningResults(req, res) {
        const { user_id, ex_listen_id, wordAnswers } = req.body;

        if (!user_id || !ex_listen_id || !Array.isArray(wordAnswers)) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        try {
            // Create submission record
            const resultSubmission = await listeningService.submitListeningResults(user_id, ex_listen_id);
            if (!resultSubmission) {
                return res.status(500).json({ error: "Failed to create submission record" });
            }

            // Lập qua mang wordAnswers để save tung cai mot
            for (const answer of wordAnswers) {
                const data = {
                    word_hidden_id: answer.word_hidden_id,
                    answer_input: answer.answer_input,
                    is_correct: answer.is_correct,
                    submit_id: resultSubmission.id,
                };
                await listeningService.saveWordAnswers(data);
            }

            // Cập nhật lại progress
            const progress = await listeningService.getUserProgress(user_id, ex_listen_id);

            if (progress) {
                // Cập nhật progress nếu cần thiết
                const updatedProgressData = {
                    user_id,
                    listen_para_id: ex_listen_id,
                    number_word_completed: wordAnswers.filter(ans => ans.is_correct).length,
                    status: wordAnswers.every(ans => ans.is_correct) ? 'completed' : 'in_progress',
                    lastSubmit: resultSubmission.id,
                    completed_date: wordAnswers.every(ans => ans.is_correct) ? new Date() : null,
                    submit_times: progress.submit_times + 1
                };
                await listeningService.updateUserProgress(updatedProgressData);
            } else {
                // Tạo mới progress nếu chưa có
                const newProgressData = {
                    user_id,
                    listen_para_id: ex_listen_id,
                    number_word_completed: wordAnswers.filter(ans => ans.is_correct).length,
                    status: wordAnswers.every(ans => ans.is_correct) ? 'completed' : 'in_progress',
                    lastSubmit: resultSubmission.id,
                    completed_date: wordAnswers.every(ans => ans.is_correct) ? new Date() : null,
                    submit_times: 1
                };
                await listeningService.createUserProgress(newProgressData);
            }

            res.json({ message: "Listening results submitted successfully" });

        } catch (error) {
            console.error("Error submitting listening results:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get progress of a user for a specific listening exercise
    async getUserProgress(req, res) {
        const { user_id, listen_para_id } = req.params;
        try {
            const data = await listeningService.getUserProgress(user_id, listen_para_id);
            res.json(data);
        } catch (error) {
            console.error("Error fetching user progress:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

};

module.exports = listeningController;