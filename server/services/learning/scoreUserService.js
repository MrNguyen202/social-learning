const supabase = require("../../lib/supabase").supabase;

const scoreUserService = {
  // Get score user by user_id
  async getScoreUserByUserId(user_id) {
    const { data, error } = await supabase
      .from("score")
      .select("*")
      .eq("userId", user_id)
      .single();

    if (error) {
      console.error("Error fetching user score:", error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  // Cộng điểm vào score detail cho user
  async addSkillScore(userId, skill, scoreToAdd) {
    const { data: inserted, error: insertError } = await supabase
      .from("scoreDetail")
      .insert({
        userId,
        skill,
        score: scoreToAdd,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return inserted;
  },

  // Trừ điểm bông tuyết
  async deductSnowflakeFromUser(user_id, snowflake) {
    const { data: snowflakeData, error: snowflakeError } = await supabase
      .from("score")
      .select("*")
      .eq("userId", user_id)
      .single();

    if (snowflakeError && snowflakeError.code !== "PGRST116") {
      console.error("Error fetching user snowflake:", snowflakeError);
      throw snowflakeError;
    }

    if (!snowflakeData) {
      // Nếu chưa có record → tạo mới
      const { data: newSnowflakeData, error: newSnowflakeError } =
        await supabase
          .from("score")
          .insert({ userId: user_id, number_snowflake: 0 })
          .select()
          .single();

      if (newSnowflakeError) {
        console.error("Error creating user snowflake:", newSnowflakeError);
        throw newSnowflakeError;
      }
      return newSnowflakeData;
    } else {
      // Cập nhật số snowflake
      const newTotalSnowflake = Math.max(
        0,
        (snowflakeData.number_snowflake ?? 0) + snowflake
      );

      const { data: updatedSnowflakeData, error: updateSnowflakeError } =
        await supabase
          .from("score")
          .update({ number_snowflake: newTotalSnowflake })
          .eq("userId", user_id)
          .select()
          .single();

      if (updateSnowflakeError) {
        console.error("Error updating user snowflake:", updateSnowflakeError);
        throw updateSnowflakeError;
      }
      return updatedSnowflakeData;
    }
  },
};

module.exports = scoreUserService;
