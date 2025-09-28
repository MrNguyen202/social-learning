import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { fetchNotifications } from '../../api/notification/route';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import Header from '../../components/Header';
import NotificationItem from './components/NotificationItem';
import { supabase } from '../../../lib/supabase';

const Notification = () => {
  const [notifications, setNotifications] = useState<any>([]);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    getNotifications();
    cleanUp();
  }, []);

  const getNotifications = async () => {
    // fetch notifications
    let res = await fetchNotifications(user.id);
    if (res.success) {
      setNotifications(res.data);
    }
  };

  const cleanUp = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await supabase.functions.invoke('delete-old-notifications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Thông báo" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
      >
        {notifications.map((item: any) => {
          return (
            <NotificationItem
              item={item}
              key={item?.id}
              navigation={navigation}
              onRead={(id: string) => {
                setNotifications((prev: any[]) =>
                  prev.map((n: any) =>
                    n.id === id ? { ...n, is_read: true } : n,
                  ),
                );
              }}
            />
          );
        })}
        {notifications.length == 0 && (
          <Text style={styles.noData}>Chưa có thông báo</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
