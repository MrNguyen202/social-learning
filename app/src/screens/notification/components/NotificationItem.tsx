import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Avatar from '../../../components/Avatar';
import moment from 'moment';
import { theme } from '../../../../constants/theme';
import { hp } from '../../../../helpers/common';
import { getUserImageSrc } from '../../../api/image/route';
import { convertToDate } from '../../../../helpers/formatTime';
import { markNotificationAsRead } from '../../../api/notification/route';

const NotificationItem = ({ item, navigation, onRead }: any) => {
  const handleClick = async () => {
    let { postId, commentId } = JSON.parse(item.content);

    if (!item.is_read) {
      await markNotificationAsRead(item.id);
      onRead?.(item.id);
    }

    navigation.navigate('PostDetail', {
      postId: postId,
      commentId: commentId,
    });
  };
  const createdAt = convertToDate(item?.created_at);
  return (
    <TouchableOpacity
      style={[styles.container, item.is_read && { opacity: 0.6 }]}
      onPress={handleClick}
    >
      <Avatar
        uri={getUserImageSrc(item?.sender?.avatar)}
        size={hp(5)}
        rounded={theme.radius.xxl * 100}
      />
      <View style={styles.nameTitle}>
        <Text style={styles.text}>{item?.sender?.name}</Text>
        <Text style={[styles.text, { color: theme.colors.textDark }]}>
          {item?.title}
        </Text>
      </View>

      <Text style={[styles.text, { color: theme.colors.textLight }]}>
        {createdAt}
      </Text>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.dark,
    padding: 15,
    borderRadius: theme.radius.xxl,
    borderCurve: 'continuous',
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
});
