import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Heart, MessageCircleMore } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const MainTab = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="bg-white px-4">
      {/* Header */}
      <View className="flex justify-between items-center flex-row py-4">
        <Text className="text-3xl font-semibold">Social Learning</Text>
        <View className="flex flex-row space-x-4">
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Notification')}
          >
            <Heart size={34} />
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Message')}
          >
            <MessageCircleMore size={34} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MainTab;
