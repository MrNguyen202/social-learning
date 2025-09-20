import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TrendingUp, Trophy } from 'lucide-react-native';

const LearningTab = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="bg-white px-4">
      {/* Header */}
      <View className="flex justify-between items-center flex-row py-4">
        <Text className="text-3xl font-semibold">Góc học tập</Text>
        <View className="flex flex-row space-x-4">
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Rankings')}
          >
            <Trophy size={34} />
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Progress')}
          >
            <TrendingUp size={34} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LearningTab;
