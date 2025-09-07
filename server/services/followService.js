const supabase = require("../lib/supabase").supabase;

const followService = {
  // B chính là người được follow (userId)
  // A chính là người đi follow (followerId)

  // A follow B
  async followUser(followerId, userId) {
    if (followerId === userId) {
      throw new Error("Bạn không thể tự follow chính mình");
    }

    // check đã tồn tại follow chưa
    const { data: existing, error: checkError } = await supabase
      .from("follows")
      .select()
      .eq("userId", userId)
      .eq("followerId", followerId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return {
        data: existing,
        msg: "Bạn đã follow người dùng này",
        error: null,
      }; // đã follow rồi
    }

    const { data, error } = await supabase
      .from("follows")
      .insert([{ userId, followerId, status: "active" }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  // Unfollow
  async unfollowUser(followerId, userId) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("userId", userId)
      .eq("followerId", followerId);

    if (error) throw error;
    return { data: true, error: null };
  },

  // Danh sách follower của 1 user (ai follow userId)
  async getFollowers(userId) {
    const { data, error } = await supabase
      .from("follows")
      .select("followerId")
      .eq("userId", userId)
      .eq("status", "active");

    if (error) throw error;
    return { data, error: null };
  },

  // Danh sách user mà 1 user đang follow (following)
  async getFollowing(followerId) {
    const { data, error } = await supabase
      .from("follows")
      .select("userId")
      .eq("followerId", followerId)
      .eq("status", "active");

    if (error) throw error;
    return { data, error: null };
  },

  // Kiểm tra A có follow B không
  async isFollowing(followerId, userId) {
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("userId", userId)
      .eq("followerId", followerId)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    return { data: !!data, error: null };
  },
};

module.exports = followService;
