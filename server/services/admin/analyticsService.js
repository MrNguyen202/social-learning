const supabase = require("../../lib/supabase").supabase;

const analyticsService = {
  // ====== RPC FUNCTIONS ======

  async loadAnalytics({ fromDate, toDate }) {
    const { data, error } = await supabase.rpc("get_analytics", {
      from_date_filter: fromDate || null,
      to_date_filter: toDate || null,
    });
    if (error) return { data: null, error };
    return { data, error: null };
  },

  async loadDifficultWords({ skill, errorType }) {
    const { data, error } = await supabase.rpc("get_difficult_words", {
      skill_filter: skill || null,
      error_type_filter: errorType || null,
    });
    if (error) return { data: null, error };
    return { data, error: null };
  },

  async loadSkillBreakdown() {
    const { data, error } = await supabase.rpc("get_skill_breakdown");
    if (error) return { data: null, error };
    return { data, error: null };
  },

  async loadVocabularyOverview() {
    const { data, error } = await supabase
      .rpc("get_vocabulary_overview")
      .single(); // Luôn trả về 1 hàng
    if (error) return { data: null, error };
    return { data, error: null };
  },

  // ====== GET ======

  async loadLeaderboard() {
    const { data, error } = await supabase
      .from("leaderBoard")
      .select(
        `
        leaderboard_type,
        score,
        rank,
        user:users ( name, avatar )
      `
      )
      .eq("leaderboard_type", "practice")
      .order("rank", { ascending: true })
      .limit(10);
    if (error) return { data: null, error };
    return { data, error: null };
  },

  async loadVocabularyTopics() {
    const { data, error } = await supabase
      .from("topicsVocab")
      .select(
        `
        id,
        name_en,
        name_vi,
        total_vocab,
        created_at,
        user:users ( name )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { data: null, error };
    return { data, error: null };
  },

  async getRevenueAnalytics(fromDate, toDate) {
    const { data, error } = await supabase.rpc("get_revenue_analytics", {
      from_date_filter: fromDate || null,
      to_date_filter: toDate || null,
    });

    if (error) {
      console.error("RPC Error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, data: data };
  },
};

module.exports = analyticsService;
