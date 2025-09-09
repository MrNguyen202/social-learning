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