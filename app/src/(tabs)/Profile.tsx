import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Menu, PlusSquare } from 'lucide-react-native';

const ProfileTab = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="bg-white px-4">
      {/* Header */}
      <View className="flex justify-between items-center flex-row py-4">
        <Text className="text-3xl font-semibold">UserName</Text>
        <View className="flex flex-row space-x-4">
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
