import { View, Text, TextInput } from 'react-native';
import React from 'react';
import { Search } from 'lucide-react-native';

const SearchTab = () => {
  return (
    <View className="bg-white px-4">
      {/* Header Search */}
      <View className="flex flex-row items-center space-x-2 bg-gray-100 px-4 rounded-3xl mt-4">
        <Search size={24} color="black" />
        <TextInput placeholder="Tìm kiếm..." className="mx-2 text-xl" />
      </View>

      {/* Images */}
      <View className="mt-4">
        <Text className="text-3xl font-semibold">Images</Text>
      </View>
    </View>
  );
};

export default SearchTab;
