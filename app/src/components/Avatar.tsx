import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { hp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const Avatar = ({
  uri,
  size = hp(4.5),
  rounded = theme.radius.xl,
  style = {},
}: any) => {
  return (
    <Image
      source={
        uri
          ? { uri }
          : require('../../assets/images/default-avatar-profile-icon.jpg')
      }
      style={[
        styles.avatar,
        { height: size, width: size, borderRadius: rounded },
        style,
      ]}
    />
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderColor: theme.colors.darkLight,
  },
});
