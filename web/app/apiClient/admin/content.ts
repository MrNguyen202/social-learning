import api from "@/lib/api";

export const loadListeningParagraphs = async ({ levelId, topicId }: any) => {
  console.log("API call with params:", { levelId, topicId });
  const response = await api.get("/api/admin/content/listening", {
    params: {
      levelId,
      topicId,
    },
  });
  return response.data;
};

export const loadWritingExercises = async ({
  levelId,
  topicId,
  typeExerciseId,
  typeParagraphId,
}: any) => {
  const response = await api.get("/api/admin/content/writing", {
    params: {
      levelId,
      topicId,
      typeExerciseId,
      typeParagraphId,
    },
  });
  return response.data;
};

export const loadSpeakingLessons = async ({ levelId, topicId }:any) => {
  const response = await api.get("/api/admin/content/speaking", {
    params: {
      levelId,
      topicId,
    },
  });
  return response.data;
};

export const loadTopics = async () => {
  const response = await api.get("/api/admin/content/topics");
  return response.data;
};

export const loadLevels = async () => {
  const response = await api.get("/api/admin/content/levels");
  return response.data;
};

export const loadTypeExercises = async () => {
  const response = await api.get("/api/admin/content/type-exercises");
  return response.data;
};

export const loadTypeParagraphs = async () => {
  const response = await api.get("/api/admin/content/type-paragraphs");
  return response.data;
};

export const createListeningParagraph = async (paragraphData: any) => {
  const response = await api.post(
    "/api/admin/content/create-listening",
    paragraphData
  );
  return response.data;
};

export const createWritingExercise = async (exerciseData: any) => {
  const response = await api.post(
    "/api/admin/content/create-writing",
    exerciseData
  );
  return response.data;
};

export const createSpeakingLesson = async (lessonData: any) => {
  const response = await api.post("/api/admin/content/create-speaking", lessonData);
  return response.data;
};

export const updateListeningParagraph = async ({ id, paragraphData }: any) => {
  const response = await api.put(
    `/api/admin/content/update-listening/${id}`,
    paragraphData
  );
  return response.data;
};

export const updateWritingExercise = async ({ id, exerciseData }: any) => {
  const response = await api.put(
    `/api/admin/content/update-writing/${id}`,
    exerciseData
  );
  return response.data;
};

export const deleteListeningParagraph = async (id: any) => {
  const response = await api.delete(`/api/admin/content/delete-listening/${id}`);
  return response.data;
};

export const deleteWritingExercise = async (id: any) => {
  const response = await api.delete(`/api/admin/content/delete-writing/${id}`);
  return response.data;
};

export const deleteSpeakingLesson = async (id: any) => {
  const response = await api.delete(`/api/admin/content/delete-speaking/${id}`);
  return response.data;
};
