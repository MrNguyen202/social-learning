import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { register, resendOtp, verifyOtp } from '../../api/auth/route';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const Register = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [sentOtp, setSentOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // regex giống web
  const nameRegex = /^[a-zA-Z0-9\s]{1,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
  const passwordRegex = /^.{8,}$/;

  // countdown OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sentOtp && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sentOtp, countdown]);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }
    if (!nameRegex.test(name)) {
      Toast.show({ type: 'error', text1: 'Tên tài khoản không hợp lệ.' });
      return;
    }
    if (!emailRegex.test(email)) {
      Toast.show({ type: 'error', text1: 'Email không hợp lệ.' });
      return;
    }
    if (!passwordRegex.test(password)) {
      Toast.show({ type: 'error', text1: 'Mật khẩu phải ít nhất 8 ký tự.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    try {
      setLoading(true);
      const res = await register({ email, password, name });
      if (res.message === 'Email đã tồn tại') {
        Toast.show({ type: 'error', text1: 'Email đã tồn tại' });
      } else {
        Toast.show({ type: 'success', text1: 'OTP đã được gửi qua email.' });
        setSentOtp(true);
        setCountdown(60);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Đăng ký thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập mã OTP.' });
      return;
    }
    try {
      setLoading(true);
      await verifyOtp({ email, otp });
      Toast.show({ type: 'success', text1: 'Xác thực thành công!' });
      navigation.replace('Login'); // chuyển sang login
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Xác thực OTP thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await resendOtp({ email });
      Toast.show({ type: 'success', text1: 'OTP mới đã được gửi.' });
      setOtp('');
      setCountdown(60);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Không thể gửi lại OTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LinearGradient colors={['#FFF7ED', '#FDF2F8']} style={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#F97316', '#EC4899']}
              style={styles.cardIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <BookOpen size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Tham gia SocialLearning</Text>
            <Text style={styles.cardDescription}>
              Tạo tài khoản của bạn và bắt đầu học cùng nhau
            </Text>
          </View>

          <View style={styles.cardContent}>
            {!sentOtp ? (
              <>
                {/* Form đăng ký */}
                <Text style={styles.label}>Tên tài khoản</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tên tài khoản"
                  value={name}
                  onChangeText={setName}
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Mật khẩu"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff size={moderateScale(20)} color="#9CA3AF" />
                    ) : (
                      <Eye size={moderateScale(20)} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* --- Xác nhận mật khẩu --- */}
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Xác nhận mật khẩu"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={moderateScale(20)} color="#9CA3AF" />
                    ) : (
                      <Eye size={moderateScale(20)} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSignUp}
                  style={styles.buttonWrapper}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#F97316', '#EC4899']}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Tạo tài khoản</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Nhập OTP */}
                <Text>Nhập mã OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6 số OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  style={styles.buttonWrapper}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#F97316', '#EC4899']}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Xác thực OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {countdown > 0 ? (
                  <Text style={styles.countdown}>
                    Vui lòng nhập OTP trong {countdown}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={loading}
                    style={styles.resendBtn}
                  >
                    <Text style={styles.resendText}>
                      {loading ? 'Đang gửi...' : 'Gửi lại OTP'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <Text style={styles.footerText}>
              Bạn đã có tài khoản?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Login')}
              >
                Đăng nhập
              </Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: scale(16),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    top: verticalScale(40), // Tăng top để tránh notch
    left: scale(16),
    position: 'absolute',
  },
  logo: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: scale(8),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(8),
    elevation: 4,
    width: '100%',
    maxWidth: scale(380),
    alignSelf: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    padding: scale(16),
  },
  cardIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#111827',
  },
  cardDescription: {
    fontSize: moderateScale(14),
    color: '#4B5563',
    textAlign: 'center',
    marginTop: verticalScale(4),
  },
  cardContent: {
    padding: scale(16),
  },
  label: {
    fontSize: moderateScale(14),
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(8),
    padding: verticalScale(8),
    paddingHorizontal: scale(8),
    marginBottom: verticalScale(12),
    fontSize: moderateScale(14),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(12),
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(8),
    fontSize: moderateScale(14),
  },
  eyeIcon: {
    padding: scale(10),
  },
  buttonWrapper: {
    marginTop: verticalScale(8),
    borderRadius: moderateScale(50),
    overflow: 'hidden',
  },
  button: {
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    marginTop: verticalScale(12),
    color: '#4B5563',
    fontSize: moderateScale(14),
  },
  link: {
    color: '#F97316',
    textDecorationLine: 'underline',
  },
  countdown: {
    textAlign: 'center',
    marginTop: verticalScale(8),
    color: '#4B5563',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  resendText: {
    color: '#F97316',
    fontWeight: '600',
    fontSize: moderateScale(14),
  },
});

export default Register;
