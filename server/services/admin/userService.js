const supabase = require("../../lib/supabase").supabase;

const userService = {
  /**
   * Tải danh sách người dùng với bộ lọc
   */
  async loadUsers({ search, fromDate, toDate }) {
    let query = supabase
      .from("users")
      .select(
        `
        id, name, email, nick_name, level, last_seen, created_at, avatar
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    // Áp dụng bộ lọc động
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(
        `name.ilike.${searchTerm},` +
          `email.ilike.${searchTerm},` +
          `nick_name.ilike.${searchTerm}`
      );
    }
    if (fromDate) {
      query = query.gte("created_at", fromDate);
    }
    if (toDate) {
      query = query.lte("created_at", toDate);
    }

    const { data, error } = await query;
    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Chi tiết một người dùng
   */
  async loadUserDetail(userId) {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id, name, email, nick_name, phone, address, bio, avatar, gender, dob, level, last_seen, created_at,
        learningStreak ( current_streak, longest_streak, last_learned_date )
      `
      )
      .eq("id", userId)
      .maybeSingle(); // Mong đợi 1 hoặc 0 kết quả

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Các bài post của user
   */
  async loadUserPosts(userId) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id, content, created_at, file,
        likes_count: postLikes(count),
        comments_count: comments(count)
      `
      )
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Thành tựu của user
   */
  async loadUserAchievements(userId) {
    const { data, error } = await supabase
      .from("userAchievements")
      .select(
        `
        id, progress, unlocked, unlocked_at,
        learningAchievements ( title, description, icon, type, skill, target )
      `
      )
      .eq("userId", userId)
      .order("unlocked", { ascending: false })
      .order("progress", { ascending: false });

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Các lỗi từ vựng của user
   */
  async loadUserErrors(userId) {
    const { data, error } = await supabase
      .from("userVocabErrors")
      .select("word, error_type, skill, error_count")
      .eq("userId", userId)
      .order("error_count", { ascending: false })
      .limit(30);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Tải điểm số của user (Query Builder)
   */
  async loadUserScores(userId) {
    const { data, error } = await supabase
      .from("scoreDetail")
      .select("skill, score, created_at")
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Từ vựng cá nhân của user
   */
  async loadUserVocabulary(userId) {
    const { data, error } = await supabase
      .from("personalVocab")
      .select(
        "id, word, error_count, mastery_score, next_review_at, created_at"
      )
      .eq("userId", userId)
      .order("mastery_score", { ascending: false })
      .limit(50);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  // --- CÁC HÀM GỌI RPC (QUERY PHỨC TẠP) ---

  /**
   * Biểu đồ tăng trưởng user (RPC)
   */
  async loadUserGrowthChart() {
    const { data, error } = await supabase.rpc("get_user_growth_chart");
    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Số user hoạt động hàng ngày (RPC)
   */
  async loadDailyActiveUsers() {
    const { data, error } = await supabase.rpc("get_daily_active_users");
    if (error) return { data: null, error };
    return { data, error: null };
  },
};

module.exports = userService;