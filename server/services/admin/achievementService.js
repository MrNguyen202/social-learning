const supabase = require("../../lib/supabase").supabase;

const achievementService = {
  /**
   * Tóm tắt thành tựu (Dùng RPC)
   */
  async loadAchievements({ type, skill }) {
    const { data, error } = await supabase.rpc("get_achievements_summary", {
      type_filter: type || null,
      skill_filter: skill || null,
    });

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Tạo một thành tựu mới
   */
  async createAchievement(achievementData) {
    // achievementData là một object: { title, description, icon, type, skill, target }
    // không cần truyền 'id' vì 'gen_random_uuid()' sẽ tự động chạy
    const { data, error } = await supabase
      .from("learningAchievements")
      .insert(achievementData)
      .select()
      .single(); // Trả về bản ghi vừa tạo

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Cập nhật một thành tự
   */
  async updateAchievement(achievementId, achievementData) {
    // achievementData là một object: { title, description, ... }
    const { data, error } = await supabase
      .from("learningAchievements")
      .update(achievementData)
      .eq("id", achievementId)
      .select()
      .single(); // Trả về bản ghi vừa cập nhật

    if (error) return { data: null, error };
    return { data, error: null };
  },
};

module.exports = achievementService;
