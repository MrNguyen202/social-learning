import { View } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, bg }: any) => {
  const { top, bottom } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 0 : 30;
  const paddingBottom = bottom > 0 ? bottom + 0 : 30;

  return (
    <View style={{ flex: 1, paddingTop, paddingBottom, backgroundColor: bg }}>{children}</View>
  );
};

export default ScreenWrapper;
