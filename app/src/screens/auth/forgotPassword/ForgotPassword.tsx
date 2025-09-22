import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { sendResetOtp } from '../../../api/auth/route';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập email.' });
      return;
    }
    setLoading(true);
    try {
      const res = await sendResetOtp({ email });
      if (res.message === 'Email không tồn tại') {
        Toast.show({ type: 'error', text1: 'Email không tồn tại.' });
      } else if (res.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP đã được gửi đến email của bạn.',
        });
        await AsyncStorage.setItem('email', email);
        navigation.navigate('VerifyOtp' as never);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-orange-50 px-4">
      <Text className="text-2xl font-bold mb-4">Quên mật khẩu</Text>
      <TextInput
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />
      <TouchableOpacity
        onPress={handleSendOtp}
        className="w-full bg-orange-500 py-3 rounded-full items-center"
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white">Gửi OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
