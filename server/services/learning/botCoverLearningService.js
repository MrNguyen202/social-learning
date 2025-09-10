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
            .from("feedbackAI")
            .insert([
                {
                    accuracy: data.accuracy,
                    highlighted: data.highlighted,
                    suggestions: data.suggestions,
                    comment: data.comment,
                    score: data.score,
                }
            ])
            .select();

        if (error) {
            console.error("Error inserting data:", error);
            throw new Error("Error saving writing feedback");
        }

        return insertedData;
    }
};

module.exports = botCoverLearningService;