import api from "@/lib/api";

// Get list writing-paragraphs by type_exercise, level and type paragraph
export const getListWritingParagraphsByTypeLevelTypeParagraph = async (
    type_exercise_slug: string,
    level_slug: string,
    type_paragraph_slug: string
) => {
    try {
        const response = await api.get(
            `/api/learning/writing/writing-paragraphs/${type_exercise_slug}/${level_slug}/${type_paragraph_slug}`
        );
        return response.data;
    } catch (error) {
        console.error(
            "Error fetching writing paragraphs by type, level and type paragraph:",
            error
        );
        throw error;
    }
};

// Get writing-paragraph by id
export const getWritingParagraphById = async (id: number) => {
    try {
        const response = await api.get(`/api/learning/writing/writing-paragraphs/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching writing paragraph by id:", error);
        throw error;
    }
};

// Generate writing-paragraph by AI
export const generateWritingParagraphByAI = async (
    level_slug: string,
    type_paragraph_slug: string
) => {
    try {
        const response = await api.post(`/api/bot-cover-learning/generate-paragraph-exercise`, {
            level_slug,
            type_paragraph_slug
        });

        console.log("Response from AI generation:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error generating writing paragraph by AI:", error);
        throw error;
    }
};

// Submit writing-paragraph exercise
export const submitWritingParagraphExercise = async (
    user_id: number,
    paragraph_id: number,
    content_submit: string,
) => {
    try {
        const response = await api.post(`/api/learning/writing/writing-paragraphs/submit`, {
            user_id,
            paragraph_id,
            content_submit
        });
        return response.data;
    } catch (error) {
        console.error("Error submitting writing paragraph exercise:", error);
        throw error;
    }
};

// Get progress writing-paragraph by user_id and paragraph_id
export const getProgressWritingParagraph = async (user_id: string, paragraph_id: number) => {
    try {
        const response = await api.get(`/api/learning/writing/get-progress/${user_id}/${paragraph_id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching progress writing paragraph:", error);
        throw error;
    }
};

// Feedback writing-paragraph exercise
export const feedbackWritingParagraphExercise = async (
    user_id: number,
    paragraph_id: number,
    content_submit: string
) => {
    try {
        const response = await api.post(
            `/api/bot-cover-learning/feedback-writing-paragraph-exercise`,
            {
                user_id,
                paragraph_id,
                content_submit
            }
        );
        console.log("Feedback response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback writing paragraph:", error);
        throw error;
    }
};

// Get history submit writingParagraph exercise by user_id and paragraph_id with feedback information
export const getHistorySubmitWritingParagraphByUserAndParagraph = async (user_id: string, paragraph_id: string) => {
  try {
    const response = await api.get(`/api/learning/writing/history-submit/${user_id}/${paragraph_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching history submit writing paragraph by user and paragraph:", error);
    throw error;
  }
};
