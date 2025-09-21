import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { LogOut, Menu, PlusSquare } from 'lucide-react-native';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

const ProfileTab = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Xử lý sau khi đăng xuất

    Toast.show({
      type: 'success',
      text1: 'Đăng xuất thành công.',
      visibilityTime: 2000,
    });
    navigation.navigate('Welcome');
  };
  return (
    <View className="bg-white px-4">
      {/* Header */}
      <View className="flex justify-between items-center flex-row py-4">
        <Text className="text-3xl font-semibold">{user?.name}</Text>
        <View className="flex flex-row space-x-4">
          <TouchableOpacity className="mx-4" onPress={handleLogout}>
            <LogOut size={34} />
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Create')}
          >
            <PlusSquare size={34} />
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Options')}
          >
            <Menu size={34} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileTab;
