import { Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../constants/theme';

const BackButton = ({ size = 30, navigation, color }: any) => {
  return (
    <Pressable onPress={() => navigation.goBack()} style={styles.button}>
      <ArrowLeft
        strokeWidth={2.5}
        size={size}
        color={color || theme.colors.text}
      />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    padding: 5,
  },
});
