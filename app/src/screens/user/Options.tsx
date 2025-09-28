import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React from 'react';
import Header from '../../components/Header';
import { LogOut } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';

const Options = () => {
  const navigation = useNavigation<any>();
  const handleLogout = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout,
        },
      ],
      { cancelable: true },
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
    Toast.show({
      type: 'success',
      text1: 'Đăng xuất thành công.',
      visibilityTime: 2000,
    });
    navigation.navigate('Welcome');
  };

  return (
    <View>
      <Header title="Cài đặt và hoạt động" />
      <Text>Options</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={24} />
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
