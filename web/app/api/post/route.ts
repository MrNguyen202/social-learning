import api from "@/lib/api";

export interface CreatePostData {
  content: string;
  userId: string;
  file: any;
}

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

export const createOrUpdatePost = async (data: CreatePostData) => {
  const response = await api.post("/api/posts/post", data);
  return response.data;
};

export const fetchPosts = async (currentUserId: string, limit = 10) => {
  const response = await api.get("/api/posts/posts", {
    params: { currentUserId, limit },
  });
  return response.data;
};

export const fetchPostsByUserId = async (userId?: string) => {
  const response = await api.get("/api/posts/posts-user", {
    params: { userId },
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

export const likePost = async (postLike: any) => {
  const response = await api.post("/api/posts/post/like", postLike);
  return response.data;
};

export const unlikePost = async (postId: number, userId: string) => {
  const response = await api.post("/api/posts/post/unlike", { postId, userId });
  return response.data;
};
