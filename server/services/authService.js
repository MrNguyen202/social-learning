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
    // 1. Check trong bảng loginAttempts
    const { data: attempt, error: attemptError } = await supabase
      .from("loginAttempts")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    // Kiểm tra và xóa nếu khóa đã HẾT HẠN
    if (attempt?.locked_until && new Date(attempt.locked_until) <= new Date()) {
      // Khóa đã hết hạn, xóa bản ghi
      await supabase.from("loginAttempts").delete().eq("id", attempt.id);

      // Đặt 'attempt' về null, coi như người này chưa thử lần nào
      attempt = null;
    }

    // 2. Nếu đang khóa (khóa CÒN HẠN) → return luôn
    if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
      return {
        data: null,
        error: { message: "Bạn đã bị khóa đăng nhập trong 15 phút." },
      };
    }

    // 3. Đăng nhập với Supabase Auth
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // 4.Nếu đăng nhập thất bại, cập nhật bảng loginAttempts
    if (loginError) {
      // Nếu chưa có bản ghi, tạo mới
      if (!attempt) {
        await supabase.from("loginAttempts").insert({
          email,
          attempts: 1,
        });
      } else {
        // Nếu đã có bản ghi, tăng số lần thử
        const newAttempts = attempt.attempts + 1;

        // Nếu đạt 5 lần, khóa trong 15 phút
        if (newAttempts >= 5) {
          await supabase
            .from("loginAttempts")
            .update({
              attempts: newAttempts,
              locked_until: new Date(Date.now() + 15 * 60000).toISOString(),
            })
            .eq("id", attempt.id);

          return {
            data: null,
            error: { message: "Bạn đã bị khóa đăng nhập trong 15 phút." },
          };
        }

        // Cập nhật số lần thử
        await supabase
          .from("loginAttempts")
          .update({ attempts: newAttempts })
          .eq("id", attempt.id);
      }

      return {
        data: null,
        error: { message: "Sai mật khẩu. Vui lòng thử lại." },
      };
    }

    // 5. Nếu đăng nhập đúng mà record vẫn còn → nghĩa là user từng sai → xóa đi
    await supabase.from("loginAttempts").delete().eq("email", email);

    // 6. ĐÃ ĐĂNG NHẬP THÀNH CÔNG lấy 'role' từ bảng 'users'
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("role") // Chỉ cần lấy cột 'role'
      .eq("id", loginData.user.id) // Dựa trên ID của user vừa đăng nhập
      .single(); // Lấy 1 dòng duy nhất

    if (profileError) {
      return {
        data: null,
        error: { message: "Không tìm thấy thông tin người dùng." },
      };
    }

    // 7. Gộp kết quả và trả về
    return {
      data: {
        session: loginData.session,
        user: loginData.user,
        role: profileData.role, // Thêm role vào kết quả trả về
      },
      error: null,
    };
  },

  async checkUserBan(userId) {
    const { data: user, error } = await supabase
      .from("users")
      .select("banned_until")
      .eq("id", userId)
      .single();

    if (error) {
      return { message: null, error };
    }

    if (user && user.banned_until && new Date(user.banned_until) > new Date()) {
      return {
        message: "Lock to " + new Date(user.banned_until).toLocaleDateString(),
        error: null,
      };
    }
    return { message: null, error: null };
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
