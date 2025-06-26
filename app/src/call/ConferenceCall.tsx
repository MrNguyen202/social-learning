import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ZegoUIKitPrebuiltVideoConference from '@zegocloud/zego-uikit-prebuilt-video-conference-rn';

export default function ConferenceCall(props:any) {
  const {route} = props;
  const {params} = route;
  const {userID, conferenceID} = params;
  return (
    <View style={styles.container}>
      <ZegoUIKitPrebuiltVideoConference
        appID={61625383}
        appSign={
          '9eb188e8e7db1255fa6e9b27cf333d3bb294b4611da4ca0e49bece77099e69fe'
        }
        userID={userID} // userID can be something like a phone number or the user id on your own user system.
        userName={'Joe'}
        conferenceID={conferenceID} // conferenceID can be any unique string.
        config={{
          onLeave: () => {
            // props.navigation.navigate('CallHome');
            props.navigation.navigate('Main', {
              screen: 'CallHome',
            });
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
