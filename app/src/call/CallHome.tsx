import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import LinearGradient from 'react-native-linear-gradient';

const CallHome = () => {
  const [userId, setUserId] = useState('');
  const [roomId, setRoomId] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const joinRoom = () => {
    console.log('Join Room', userId, roomId);
  };

  useEffect(() => {
    const newUserId = uuid.v4();
    setUserId(newUserId);
    setRoomId(String(Math.floor(Math.random() * 10000)));
  }, []);

  return (
    <LinearGradient
      colors={['#FEF3C7', '#FECACA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      <View>
        <Text className="font-bold text-xl">User Id: {userId}</Text>
        <Text className="font-bold text-xl">Room Id: {roomId}</Text>

        <TextInput
          placeholder="Enter room id"
          onChangeText={text => setRoomId(text)}
          value={roomId}
        ></TextInput>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ConferenceCall', {
              userID: userId,
              conferenceID: roomId,
            });
          }}
        >
          <LinearGradient
            colors={['#F97316', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <Text className="text-white text-center font-bold">Join Room</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default CallHome;

const styles = StyleSheet.create({});
