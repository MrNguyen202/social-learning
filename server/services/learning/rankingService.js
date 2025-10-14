const supabase = require("../../lib/supabase").supabase;

const rankingService = {
  async getLeaderBoardByType(leaderboard_type) {
    const { data, error } = await supabase
      .from("leaderBoard")
      .select(
        `
        score,
        rank,
        leaderboard_type,
        users:userId (
            id,
            name,
            nick_name,
            avatar
        )
        `
      )
      .eq("leaderboard_type", leaderboard_type)
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;
    return { data, error: null };
  },

  // Lấy vị trí xếp hạng của một người dùng cụ thể
  async getUserRank(userId) {
    const { data, error } = await supabase
      .from("leaderBoard")
      .select(
        `
            score,
            rank,
            leaderboard_type,
            users:userId (
                id,
                name,
                nick_name,
                avatar
            )
            `
      )
      .eq("userId", userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  },
};

module.exports = rankingService;
