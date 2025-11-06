import React, { useEffect, useState } from 'react';
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
import { verifyResetOtp } from '../../../api/auth/route';

export default function VerifyOTP() {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập mã OTP.' });
      return;
    }
    setLoading(true);
    const email = await AsyncStorage.getItem('email');
    try {
      const res = await verifyResetOtp({ email, otp });
      if (!res.success) {
        Toast.show({
          type: 'error',
          text1: res.message || 'Xác thực OTP thất bại res.',
        });
        return;
      }
      Toast.show({ type: 'success', text1: 'Xác thực thành công!' });
      await AsyncStorage.setItem(
        'resetSession',
        JSON.stringify(res.data.session),
      );

      navigation.navigate('NewPassword' as never);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Xác thực OTP thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-orange-50 px-4">
      <Text className="text-xl font-bold mb-4">Nhập OTP</Text>
      <TextInput
        placeholder="Nhập mã OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        className="w-full border rounded-lg px-3 py-2 mb-4 text-center"
        maxLength={6}
      />
      <TouchableOpacity
        onPress={handleVerifyOtp}
        className="w-full bg-orange-500 py-3 rounded-full items-center"
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white">Xác thực OTP</Text>
        )}
      </TouchableOpacity>

      {countdown > 0 ? (
        <Text className="mt-4 text-gray-600">
          Vui lòng nhập OTP trong {countdown} giây
        </Text>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text className="mt-4 text-orange-600">Quay lại đăng nhập</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
