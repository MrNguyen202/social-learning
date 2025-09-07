import api from "@/lib/api";

export interface CreatePostData {
  content: string;
  userId: string;
  file: any;
}

export const createOrUpdatePost = async (data: CreatePostData) => {
  const response = await api.post("/api/posts/post", data);
  return response.data;
};

export const fetchPosts = async (limit = 10, userId?: string) => {
  const response = await api.get("/api/posts/posts", {
    params: { limit, userId },
  });
  return response.data;
};

export const getPostById = async (postId: string) => {
  const response = await api.get(`/api/posts/post/${postId}`);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/api/posts/post/${postId}`);
  return response.data;
};

export const convertFileToBase64 = (
  file: File
): Promise<{
  fileBase64: string;
  fileName: string;
  mimeType: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1];
        resolve({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type,
        });
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
