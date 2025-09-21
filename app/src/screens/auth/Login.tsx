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
import { BookOpen } from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Toast from 'react-native-toast-message';
import { login } from '../../api/auth/route';
import { supabase } from '../../../lib/supabase';

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
      const res = await login({ email, password });

      if (!res.success || !res?.data?.session) {
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
      navigation.navigate('Main');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại.',
        visibilityTime: 2000,
      });
    }
  };

  return (
    <ScreenWrapper bg="#FFF7ED">
      <LinearGradient colors={['#FFF7ED', '#FDF2F8']} style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#F97316', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logo}
          >
            <BookOpen size={20} color="#fff" />
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
              <BookOpen size={24} color="#fff" />
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
                id="email"
                value={email}
                onChangeText={value => setEmail(value)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor="#A1A1AA"
                secureTextEntry
                id="password"
                value={password}
                onChangeText={value => setPassword(value)}
              />
            </View>
            <View style={styles.forgotPassword}>
              <Text style={styles.link}>Quên mật khẩu?</Text>
            </View>
            <LinearGradient
              colors={['#F97316', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 50 }}
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    padding: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  cardContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#111827',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  link: {
    fontSize: 12,
    color: '#F97316',
    textDecorationLine: 'underline',
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default Login;
