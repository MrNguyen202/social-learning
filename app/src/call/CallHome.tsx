import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import uuid from 'react-native-uuid';

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
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: 16,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>User Id: {userId}</Text>
      <Text>Room Id: </Text>

      <TextInput
        placeholder="Enter room id"
        onChangeText={text => setRoomId(text)}
        value={roomId}></TextInput>
      <Button
        disabled={roomId.length === 0}
        title="Join Room"
        onPress={() => {
          navigation.navigate('ConferenceCall', {
            userID: userId,
            conferenceID: roomId,
          });
        }}
        ></Button>
    </View>
  );
};

export default CallHome;

const styles = StyleSheet.create({});
