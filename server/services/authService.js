const e = require("express");

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

  async sendResetOtp(email) {
    // Gửi OTP về email
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }, // Không tạo user mới
    });
    if (error) throw error;
    return { data, error };
  },

  async verifyResetOtp(email, otp) {
    // Xác minh OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });
    if (error) throw error;

    // data.session chứa access_token + refresh_token

    return { data, error };
  },

  async newPassword(session, newPassword) {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

      if (sessionError) {
        throw sessionError;
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = authService;
