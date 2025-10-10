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
    // Kiểm tra xem user đã có điểm kỹ năng này chưa
    const { data: existing, error: checkError } = await supabase
      .from("scoreDetail")
      .select("*")
      .eq("userId", userId)
      .eq("skill", skill)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking scoreDetail:", checkError);
      throw checkError;
    }

    if (!existing) {
      // Nếu chưa có, tạo mới
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
    } else {
      // Nếu có rồi → cộng thêm điểm
      const newScore = existing.score + scoreToAdd;
      const { data: updated, error: updateError } = await supabase
        .from("scoreDetail")
        .update({
          score: newScore,
          updated_at: new Date().toISOString(),
        })
        .eq("userId", userId)
        .eq("skill", skill)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated;
    }
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
