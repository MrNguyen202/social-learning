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
      .select(
        `
      follower:followerId (
        id,
        name,
        nick_name,
        avatar
      )
    `
      )
      .eq("userId", userId)
      .eq("status", "active");

    if (error) throw error;
    return { data, error: null };
  },

  // Danh sách user mà 1 user đang follow (following) (đang theo dõi ai)
  async getFollowing(followerId) {
    const { data, error } = await supabase
      .from("follows")
      .select(
        `
      users:userId (
        id,
        name,
        nick_name,
        avatar
      )
    `
      )
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

  // Tìm kiếm bạn bè (người follow hoặc được follow) của user theo từ khóa
  async searchUserFriends(currentUserId, keyword) {
    // 1. Lấy danh sách ID người mình đang follow
    const { data: followingData, error: err1 } = await supabase
      .from("follows")
      .select("userId")
      .eq("followerId", currentUserId)
      .eq("status", "active");

    // 2. Lấy danh sách ID người đang follow mình
    const { data: followersData, error: err2 } = await supabase
      .from("follows")
      .select("followerId")
      .eq("userId", currentUserId)
      .eq("status", "active");

    if (err1 || err2) throw new Error("Lỗi khi lấy danh sách bạn bè");

    // 3. Gộp ID lại thành 1 mảng duy nhất (loại bỏ trùng lặp bằng Set)
    const friendIds = new Set([
      ...followingData.map((item) => item.userId),
      ...followersData.map((item) => item.followerId),
    ]);

    // Chuyển về mảng
    const idsArray = Array.from(friendIds);

    if (idsArray.length === 0) {
      return { data: [], error: null }; // Không có bạn bè nào
    }

    // 4. Query tìm kiếm user trong danh sách ID này
    const { data, error } = await supabase
      .from("users")
      .select("id, name, nick_name, avatar")
      .in("id", idsArray) // <--- QUAN TRỌNG: Chỉ tìm trong danh sách bạn bè
      .or(`name.ilike.%${keyword}%,nick_name.ilike.%${keyword}%`);

    if (error) throw error;
    return { data, error: null };
  },
};

module.exports = followService;
