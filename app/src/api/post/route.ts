import api from '../../../lib/api';
import RNFS from 'react-native-fs';

export interface CreatePostData {
  id?: number;
  content: string;
  userId: string;
  file: any;
}

export const convertFileToBase64 = async (
  uri: string,
): Promise<string | null> => {
  try {
    if (!uri.startsWith('file://')) {
      return null;
    }

    const base64 = await RNFS.readFile(uri, 'base64');
    return base64;
  } catch (error) {
    return null;
  }
};

export const createPost = async (data: CreatePostData) => {
  const response = await api.post('/api/posts/post', data);
  return response.data;
};

export const updatePost = async (data: CreatePostData) => {
  const response = await api.put('/api/posts/update-post', data);
  return response.data;
};

export const fetchPosts = async (
  currentUserId: string,
  limit = 10,
  offset = 0,
) => {
  const response = await api.get('/api/posts/posts', {
    params: { currentUserId, limit, offset },
  });
  return response.data;
};

export const fetchPostsByUserId = async (userId?: string) => {
  const response = await api.get('/api/posts/posts-user', {
    params: { userId },
  });
  return response.data;
};

export const getPostById = async (postId: number) => {
  const response = await api.get(`/api/posts/post/detail`, {
    params: { postId },
  });
  return response.data;
};

export const deletePost = async (postId: number) => {
  const response = await api.delete(`/api/posts/post/delete/${postId}`);
  return response.data;
};

export const likePost = async (postLike: any) => {
  const response = await api.post('/api/posts/post/like', postLike);
  return response.data;
};

export const unlikePost = async (postId: number, userId: string) => {
  const response = await api.post('/api/posts/post/unlike', { postId, userId });
  return response.data;
};

export const fetchComments = async (postId: number) => {
  const response = await api.get('/api/posts/post/comments', {
    params: { postId },
  });
  return response.data;
};

export const addComment = async (commentData: any) => {
  const response = await api.post('/api/posts/post/add-comment', commentData);
  return response.data;
};

export const deleteComment = async (commentId: number) => {
  const response = await api.delete('/api/posts/post/delete-comment', {
    data: { commentId },
  });
  return response.data;
};
