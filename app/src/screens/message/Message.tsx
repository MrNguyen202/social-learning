import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { ArrowLeft, SquarePen } from 'lucide-react-native'
import useAuth from '../../../hooks/useAuth'
import ListConversation from './components/ListConversation'
import { useNavigation } from '@react-navigation/native'

const Message = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  return (
    <View className='p-4 flex gap-2'>
      {/* Header */}
      <View className="flex flex-row justify-between items-center px-2">
        <View className="flex flex-row items-center gap-4">
          <ArrowLeft size={28} className="text-gray-600" onPress={() => navigation.goBack()} />
          <Text className="text-2xl font-bold text-gray-800">{user?.name || 'User'}</Text>
        </View>
        <SquarePen width={32} height={32} />
      </View>

      {/* Search Input */}
      <TextInput
        placeholder="Find conversations or users"
        className="border border-gray-300 rounded-lg p-4 text-base"
      />

      {/* Conversations List */}
      <ListConversation />
    </View>
  )
}

export default Message