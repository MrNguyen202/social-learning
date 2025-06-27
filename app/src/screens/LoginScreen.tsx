import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PenTool } from 'lucide-react-native';

const LoginScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FDF2F8']} // orange-50 to pink-50
      style={styles.container}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={['#F97316', '#EC4899']} // orange-500 to pink-500
          style={styles.logo}
        >
          <PenTool size={20} color="#fff" />
        </LinearGradient>
        <TouchableOpacity onPress={() => navigation.navigate('LandingScreen')}>
          <Text style={styles.logoText}>SocialLearning</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#F97316', '#EC4899']}
            style={styles.cardIcon}
          >
            <PenTool size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.cardTitle}>Chào mừng trở lại</Text>
          <Text style={styles.cardDescription}>
            Đăng nhập để tiếp tục hành trình nào
          </Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email hoặc số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email hoặc số điện thoại"
              placeholderTextColor="#A1A1AA"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu của bạn"
              placeholderTextColor="#A1A1AA"
              secureTextEntry
            />
          </View>
          <View style={styles.forgotPassword}>
            <Text style={styles.link}>Quên mật khẩu?</Text>
          </View>
          <LinearGradient colors={['#F97316', '#EC4899']} style={styles.button}>
            <TouchableOpacity>
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
    borderRadius: 8,
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
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default LoginScreen;
