const supabase = require("../lib/supabase").supabase;

const userService = {
  async getUserData(userId) {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { data, error };
  },

  async getUsersData() {
    const { data, error } = await supabase.from("users").select();

    if (error) throw error;
    return { data, error };
  },

  async updateUser(userId, userData) {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId);

    if (error) throw error;

    const { data: updatedData, error: fetchError } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    return { data: updatedData, error: null };
  },
};

module.exports = userService;
