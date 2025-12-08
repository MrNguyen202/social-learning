import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { login } from '../../api/auth/route';
import { supabase } from '../../../lib/supabase';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const Login = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Xử lý đăng nhập ở đây
    if (!email || !password) {
      Toast.show({
        type: 'info',
        text1: 'Vui lòng nhập email và mật khẩu.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await login({
        email,
        password,
      });

      if (!res.success || !res?.data?.session) {
        const msg = res.message || '';
        if (msg.includes('khóa đăng nhập') || msg.includes('15 phút')) {
          Toast.show({
            type: 'error',
            text1: 'Tài khoản đang bị khóa',
            text2: 'Vui lòng thử lại sau 15 phút.',
            visibilityTime: 3000,
          });
          return;
        }

        Toast.show({
          type: 'error',
          text1: 'Đăng nhập thất bại',
          visibilityTime: 1000,
        });
        return;
      }

      const { error: setError } = await supabase.auth.setSession(
        res.data.session,
      );

      const { data: funcData, error: funcError } =
        await supabase.functions.invoke('update-last-seen', {
          body: { name: 'Functions' },
        });

      if (funcError) console.error('Error updating last_seen:', funcError);

      if (setError) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi khi đặt phiên.',
          visibilityTime: 1000,
        });
        console.error('Lỗi khi đặt phiên:', setError.message);
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công.',
        visibilityTime: 2000,
      });
      navigation.navigate('BottomTabs');
    } catch (error: any) {
      const errorMsg =
        error?.message ||
        error?.response?.data?.message ||
        JSON.stringify(error);
      if (errorMsg.includes('khóa đăng nhập') || errorMsg.includes('15 phút')) {
        Toast.show({
          type: 'error',
          text1: 'Tài khoản đang bị khóa',
          text2: 'Vui lòng thử lại sau 15 phút.',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Đăng nhập thất bại.',
          visibilityTime: 2000,
        });
      }
    }
  };

  return (
    <LinearGradient colors={['#FFF7ED', '#FDF2F8']} style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={['#F97316', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logo}
        >
          <BookOpen size={moderateScale(20)} color="#fff" />
        </LinearGradient>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.logoText}>SocialLearning</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#F97316', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardIcon}
          >
            <BookOpen size={moderateScale(24)} color="#fff" />
          </LinearGradient>
          <Text style={styles.cardTitle}>Chào mừng trở lại</Text>
          <Text style={styles.cardDescription}>
            Đăng nhập để tiếp tục hành trình nào
          </Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor="#A1A1AA"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor="#A1A1AA"
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
          </View>
          <View style={styles.forgotPassword}>
            <Text
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.link}
            >
              Quên mật khẩu?
            </Text>
          </View>
          <LinearGradient
            colors={['#F97316', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: moderateScale(50) }}
          >
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>Đăng Nhập</Text>
            </TouchableOpacity>
          </LinearGradient>
          <Text style={styles.footerText}>
            Bạn chưa có tài khoản?{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
            >
              Đăng ký
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
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
    position: 'absolute',
    top: verticalScale(40), // Tăng lên một chút để tránh tai thỏ (notch)
    left: scale(16),
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    // Thay vì max-width cứng 400, ta dùng alignSelf center + width
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
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  cardDescription: {
    fontSize: moderateScale(14),
    color: '#4B5563',
    textAlign: 'center',
  },
  cardContent: {
    padding: scale(16),
  },
  inputContainer: {
    marginBottom: verticalScale(12),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(8),
    backgroundColor: '#fff',
  },
  // [THÊM MỚI] Input password bên trong (không viền vì viền nằm ở container cha)
  passwordInput: {
    flex: 1,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    fontSize: moderateScale(14),
    color: '#111827',
  },
  // [THÊM MỚI] Nút icon mắt
  eyeIcon: {
    padding: scale(10),
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
    padding: verticalScale(10), // Padding input dọc
    paddingHorizontal: scale(10), // Padding input ngang
    fontSize: moderateScale(14),
    color: '#111827',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: verticalScale(12),
  },
  link: {
    fontSize: moderateScale(14),
    color: '#F97316',
    textDecorationLine: 'underline',
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
    fontSize: moderateScale(14),
    color: '#4B5563',
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
});

export default Login;
