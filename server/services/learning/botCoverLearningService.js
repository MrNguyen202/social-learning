const supabase = require("../../lib/supabase").supabase;

const botCoverLearningService = {
    // Generate paragraph exercise lưu vào bảng writingParagraphs
    async createParagraphExercise(data) {
        const { data: insertedData, error } = await supabase
            .from("writingParagraphs")
            .insert([
                {
                    content_vi: data.content_vi,
                    content_en: data.content_en,
                    title: data.title,
                    level_id: data.level_id,
                    type_exercise_id: data.type_exercise_id,
                    topic_id: data.topic_id,
                    type_paragraph_id: data.type_paragraph_id,
                    number_sentence: data.number_sentence
                }
            ])
            .select();

        if (error) {
            console.error("Error inserting data:", error);
            throw new Error("Error creating paragraph exercise");
        }

        return insertedData;
    },

    // Lưu feedback bài tập viết
    async saveWritingFeedback(data) {
        const { data: insertedData, error } = await supabase
            .from("feedbackParagraphAI")
            .insert([
                {
                    score: data.score,
                    accuracy: data.accuracy,
                    strengths: data.strengths,
                    comment: data.comment,
                }
            ])
            .select();

        // Lưu errors vào bảng feedbackErrors
        if (data.errors && data.errors.length > 0) {
            const feedback_id = insertedData[0].id;
            const errorRecords = data.errors.map(err => ({
                original: err.original,
                error_type: err.error_type,
                highlight: err.highlight,
                suggestions: err.suggestion,
                feedback_id: feedback_id,
            }));
            const { error: errorInsert } = await supabase
                .from("errorFeedback")
                .insert(errorRecords);
            if (errorInsert) {
                console.error("Error inserting feedback errors:", errorInsert);
                throw new Error("Error saving feedback errors");
            }
        }

        if (error) {
            console.error("Error inserting feedback:", error);
            throw new Error("Error saving writing feedback");
        }

        return insertedData;
    },

    // Generate listening exercise lưu vào bảng listeningExercises
    async createListeningExercise(data) {
        // Insert listenParagraph
        const { data: insertedData, error } = await supabase
            .from("listenParagraphs")
            .insert([
                {
                    title: data.title,
                    text_content: data.text_content,
                    audio_url: null,
                    level_id: data.level_id,
                    topic_id: data.topic_id,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error("Error inserting listening exercise:", error);
            throw new Error("Error creating listening exercise");
        }

        const listening_exercise = insertedData[0];

        // Tách text_content thành mảng từ
        const words = listening_exercise.text_content
            .replace(/[.,!?]/g, "") // bỏ dấu câu cơ bản
            .split(/\s+/);

        // Insert word_hiddens với vị trí chính xác
        if (data.word_hiddens && data.word_hiddens.length > 0) {
            const wordHiddenRecords = [];

            data.word_hiddens.forEach((hiddenWord) => {
                words.forEach((w, idx) => {
                    if (w.toLowerCase() === hiddenWord.toLowerCase()) {
                        wordHiddenRecords.push({
                            position: idx + 1, // vị trí theo thứ tự từ trong đoạn text
                            answer: hiddenWord,
                            created_at: new Date().toISOString(),
                            listen_para_id: listening_exercise.id
                        });
                    }
                });
            });

            if (wordHiddenRecords.length > 0) {
                const { error: wordError } = await supabase
                    .from("wordHidden")
                    .insert(wordHiddenRecords);

                if (wordError) {
                    console.error("Error inserting word_hiddens:", wordError);
                    throw new Error("Error creating word_hiddens");
                }
            }
        }

        return {
            message: "Tạo bài tập nghe thành công",
            data: listening_exercise
        };
    }

};

module.exports = botCoverLearningService;