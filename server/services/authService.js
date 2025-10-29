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
    // 1. Đăng nhập với Supabase Auth
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) throw loginError;

    // 2. ĐÃ ĐĂNG NHẬP THÀNH CÔNG
    // Bây giờ, lấy 'role' từ bảng 'users' của bạn
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("role") // Chỉ cần lấy cột 'role'
      .eq("id", loginData.user.id) // Dựa trên ID của user vừa đăng nhập
      .single(); // Lấy 1 dòng duy nhất

    if (profileError) {
      // Lỗi này xảy ra nếu trigger của bạn bị lỗi
      // hoặc user tồn tại trong 'auth.users' nhưng không có trong 'public.users'
      console.error(
        "Lỗi nghiêm trọng: Không tìm thấy profile cho user:",
        loginData.user.id
      );
      throw new Error("Không tìm thấy thông tin hồ sơ người dùng.");
    }

    // 3. Gộp kết quả và trả về
    return {
      data: {
        session: loginData.session,
        user: loginData.user,
        role: profileData.role, // <-- Đây là mấu chốt!
      },
      error: null,
    };
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
