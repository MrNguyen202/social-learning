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
import { forgotPassword } from '../../../api/auth/route';

export default function NewPassword() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewPassword = async () => {
    if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Mật khẩu phải có ít nhất 8 ký tự.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setLoading(true);
    try {
      const resetSession = await AsyncStorage.getItem('resetSession');
      const session = resetSession ? JSON.parse(resetSession) : null;
      if (!session) throw new Error('Thiếu session. Vui lòng nhập OTP lại.');

      const res = await forgotPassword({ session, password });
      console.log('Response from forgotPassword:', res);
      if (!res.success) throw new Error(res.message);

      Toast.show({ type: 'success', text1: 'Đổi mật khẩu thành công!' });
      await AsyncStorage.removeItem('resetSession');
      await AsyncStorage.removeItem('email');
      navigation.navigate('Login' as never);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Đổi mật khẩu thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-orange-50 px-4">
      <Text className="text-2xl font-bold mb-4">Đặt mật khẩu mới</Text>

      <TextInput
        placeholder="Nhập mật khẩu mới"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />
      <TextInput
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <TouchableOpacity
        onPress={handleNewPassword}
        className="w-full bg-orange-500 py-3 rounded-full items-center"
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white">Đổi mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
