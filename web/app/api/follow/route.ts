import api from "@/lib/api";
// B chính là người được follow (userId)
// A chính là người đi follow (followerId)

// A follow B

// Follow 1 user
export const followUser = async (followerId: string, userId: string) => {
  const response = await api.post("/api/follows", { followerId, userId });
  return response.data;
};

// Unfollow 1 user
export const unfollowUser = async (followerId: string, userId: string) => {
  const response = await api.delete(`/api/follows`, {
    data: { followerId, userId },
  });
  return response.data;
};

// Danh sách follower của 1 user (ai follow userId) (ai đang theo dõi)
export const getFollowers = async (userId: string) => {
  const response = await api.get("/api/follows/followers", {
    params: { userId },
  });
  return response.data;
};

// Danh sách user mà 1 user đang follow (following) (đang theo dõi ai)
export const getFollowing = async (followerId: string) => {
  const response = await api.get("/api/follows/following", {
    params: { followerId },
  });
  return response.data;
};

// Kiểm tra A có follow B không
export const checkIsFollowing = async (followerId: string, userId: string) => {
  const response = await api.get(`/api/follows/is-following`, {
    params: { followerId, userId },
  });
  return response.data;
};
