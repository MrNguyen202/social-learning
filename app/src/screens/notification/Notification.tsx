// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   SafeAreaView,
//   TouchableOpacity,
// } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import useAuth from '../../../hooks/useAuth';
// import { useNavigation } from '@react-navigation/native';
// import { fetchNotifications } from '../../api/notification/route';
// import { hp, wp } from '../../../helpers/common';
// import { theme } from '../../../constants/theme';
// import Header from '../../components/Header';
// import NotificationItem from './components/NotificationItem';
// import { supabase } from '../../../lib/supabase';
// import { ArrowLeft, Bell, BellOff } from 'lucide-react-native';
// import LinearGradient from 'react-native-linear-gradient';

// const Notification = () => {
//   const [notifications, setNotifications] = useState<any>([]);
//   const { user } = useAuth();
//   const navigation = useNavigation();

//   useEffect(() => {
//     getNotifications();
//     cleanUp();
//   }, []);

//   const getNotifications = async () => {
//     let res = await fetchNotifications(user.id);
//     if (res.success) {
//       setNotifications(res.data);
//     }
//   };

//   const cleanUp = async () => {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     if (!session?.access_token) return;

//     await supabase.functions.invoke('delete-old-notifications', {
//       method: 'POST',
//       headers: { Authorization: `Bearer ${session.access_token}` },
//     });
//   };

//   const unreadCount = notifications.filter((n: any) => !n.is_read).length;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header với gradient */}
//       <LinearGradient
//         colors={['#667eea', '#764ba2']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.headerGradient}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//             activeOpacity={0.8}
//           >
//             <ArrowLeft size={24} color="#fff" />
//           </TouchableOpacity>
//           <View style={styles.headerCenter}>
//             <Text style={styles.headerTitle}>Thông báo</Text>
//             {unreadCount > 0 && (
//               <Text style={styles.headerSubtitle}>
//                 {unreadCount} thông báo mới
//               </Text>
//             )}
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Content */}
//       <View style={styles.content}>
//         {notifications.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <View style={styles.emptyIconContainer}>
//               <BellOff size={48} color="#9ca3af" />
//             </View>
//             <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
//             <Text style={styles.emptyDescription}>
//               Khi có hoạt động mới, bạn sẽ nhận được thông báo ở đây
//             </Text>
//           </View>
//         ) : (
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//           >
//             {/* Stats */}
//             {unreadCount > 0 && (
//               <View style={styles.statsContainer}>
//                 <Text style={styles.statsText}>
//                   Bạn có {unreadCount} thông báo chưa đọc
//                 </Text>
//               </View>
//             )}

//             {/* Notifications List */}
//             {notifications.map((item: any) => (
//               <NotificationItem
//                 item={item}
//                 key={item?.id}
//                 navigation={navigation}
//                 onRead={(id: string) => {
//                   setNotifications((prev: any[]) =>
//                     prev.map((n: any) =>
//                       n.id === id ? { ...n, is_read: true } : n,
//                     ),
//                   );
//                 }}
//               />
//             ))}
//           </ScrollView>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Notification;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//   },
//   headerGradient: {
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: 20,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerCenter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'center',
//     marginRight: wp(10),
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#ffffff',
//     opacity: 0.8,
//     marginTop: 2,
//   },
//   content: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     marginTop: -12,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//   },
//   emptyIconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#f3f4f6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 8,
//   },
//   emptyDescription: {
//     fontSize: 14,
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   listContainer: {
//     padding: 16,
//     paddingBottom: 32,
//   },
//   statsContainer: {
//     backgroundColor: '#f0f4ff',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#e0e7ff',
//   },
//   statsText: {
//     fontSize: 14,
//     color: '#667eea',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

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
import {
  fetchNotifications,
  fetchNotificationsLearning,
} from '../../api/notification/route';
import { hp, wp } from '../../../helpers/common';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, BellOff } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import NotificationItem from './components/NotificationItem';
import NotificationItemLearning from './components/NotificationItemLearning';

const Notification = () => {
  const [activeTab, setActiveTab] = useState<'social' | 'learning'>('social');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLearning, setNotificationsLearning] = useState<any[]>([]);

  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    getSocial();
    getLearning();
    cleanUp();
  }, []);

  const getSocial = async () => {
    const res = await fetchNotifications(user.id);
    if (res.success) setNotifications(res.data);
  };

  const getLearning = async () => {
    const res = await fetchNotificationsLearning(user.id);
    if (res.success) setNotificationsLearning(res.data);
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

  const unreadSocial = notifications.filter(n => !n.is_read).length;
  const unreadLearning = notificationsLearning.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={styles.container}>
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
          </View>
        </View>

        {/* --- Tabs --- */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'social' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('social')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'social' && styles.tabTextActive,
              ]}
            >
              Mạng xã hội ({unreadSocial})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'learning' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('learning')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'learning' && styles.tabTextActive,
              ]}
            >
              Học tập ({unreadLearning})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {(
          activeTab === 'social'
            ? notifications.length === 0
            : notificationsLearning.length === 0
        ) ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <BellOff size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {activeTab === 'social'
              ? notifications.map(n => (
                  <NotificationItem
                    key={n.id}
                    item={n}
                    navigation={navigation}
                    onRead={(id: string) =>
                      setNotifications(prev =>
                        prev.map(x =>
                          x.id === id ? { ...x, is_read: true } : x,
                        ),
                      )
                    }
                  />
                ))
              : notificationsLearning.map(n => (
                  <NotificationItemLearning
                    key={n.id}
                    item={n}
                    navigation={navigation}
                    onRead={(id: string) =>
                      setNotificationsLearning(prev =>
                        prev.map(x =>
                          x.id === id ? { ...x, is_read: true } : x,
                        ),
                      )
                    }
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
  container: { flex: 1, backgroundColor: '#f9fafb' },

  headerGradient: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  headerContent: { flexDirection: 'row', alignItems: 'center' },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: { flex: 1, alignItems: 'center' },

  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },

  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
  },

  tabButtonActive: {
    backgroundColor: '#fff',
  },

  tabText: {
    textAlign: 'center',
    color: '#e5e7eb',
    fontSize: 14,
  },

  tabTextActive: {
    color: '#4b5563',
    fontWeight: '700',
  },

  content: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: { fontSize: 18, fontWeight: 'bold' },

  listContainer: { padding: 16, paddingBottom: 32 },
});
