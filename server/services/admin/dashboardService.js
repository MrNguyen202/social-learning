const supabase = require("../../lib/supabase").supabase;

const dashboardService = {
  /**
   * Các chỉ số chính của dashboard
   */
  async loadDashboardMetrics() {
    const { data, error } = await supabase
      .rpc("get_dashboard_metrics")
      .single(); // Query này luôn trả về 1 hàng, .single() để lấy object

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Tải 5 người dùng hoạt động gần nhất
   */
  async loadRecentActivities(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, last_seen, avatar")
      .order("last_seen", { ascending: false })
      .neq("id", userId)
      .limit(5);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Tải 5 bài post chờ kiểm duyệt
   * (Lưu ý: Query gốc của bạn không có `WHERE moderation_status = 'pending'`.
   */
  async loadPendingModeration() {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
      id,
      content,
      created_at,
      users(name),
      comments(count)
    `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) return { data: null, error };

    // ✅ Chuẩn hóa dữ liệu để frontend đọc dễ dàng
    const normalized = data.map((post) => ({
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      user_name: post.users?.name ?? "Unknown",
      comment_count: post.comments?.[0]?.count ?? 0,
    }));

    return { data: normalized, error: null };
  },

  /**
   * Thống kê tần suất học tập theo ngày và giờ
   * 
  */
  async loadLearningFrequencyStats() {
    const { data, error } = await supabase.rpc("get_learning_frequency_stats");

    if (error) return { data: null, error };

    // Map số 0-6 thành tên thứ, map giờ thành string
    const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formattedDays = (data.days_stats || []).map((item) => ({
      day: daysMap[item.day_index],
      count: item.usage_count,
    }));

    const formattedHours = (data.hours_stats || []).map((item) => ({
      hour: `${item.hour_index}:00`,
      count: item.usage_count,
    }));

    return {
      data: {
        byDay: formattedDays,
        byHour: formattedHours,
      },
      error: null,
    };
  },
};

module.exports = dashboardService;
