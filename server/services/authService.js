const supabase = require("../lib/supabase").supabase;

const authService = {
  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return { data, error };
  },

  async verifyRegisterOtp(email, otp) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) throw error;
    return { data, error };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error };
  },
};

module.exports = authService;
