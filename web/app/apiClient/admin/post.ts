import api from "@/lib/api";

export const loadPost = async ({ search, fromDate, toDate }: any) => {
  const response = await api.get("/api/admin/posts", {
    params: {
      search,
      fromDate,
      toDate,
    },
  });
  return response.data;
};

export const loadPostComments = async (postId: string) => {
  const response = await api.get(`/api/admin/posts/${postId}/comments`);
  return response.data;
};

export const deletePostByAdmin = async (postId: string) => {
  const response = await api.delete(`/api/admin/posts/${postId}`);
  return response.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await api.delete(`/api/admin/comments/${commentId}`);
  return response.data;
};
