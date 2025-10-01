import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { fetchNotifications } from '../../api/notification/route';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import Header from '../../components/Header';
import NotificationItem from './components/NotificationItem';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Bell, BellOff } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const Notification = () => {
  const [notifications, setNotifications] = useState<any>([]);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    getNotifications();
    cleanUp();
  }, []);

  const getNotifications = async () => {
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

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadCount} thông báo mới
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <BellOff size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={styles.emptyDescription}>
              Khi có hoạt động mới, bạn sẽ nhận được thông báo ở đây
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {/* Stats */}
            {unreadCount > 0 && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  Bạn có {unreadCount} thông báo chưa đọc
                </Text>
              </View>
            )}

            {/* Notifications List */}
            {notifications.map((item: any) => (
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
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginRight: wp(10),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  statsText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    textAlign: 'center',
  },
});
