import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Heart, MessageCircleMore, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { getUserData } from '../api/user/route';
import { supabase } from '../../lib/supabase';
import { fetchPosts } from '../api/post/route';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import PostCard from '../screens/post/PostCard';
import Loading from '../components/Loading';
import LinearGradient from 'react-native-linear-gradient';
import { getSocket } from '../../socket/socketClient';
import { fetchTotalUnreadMessages } from '../api/chat/conversation/route';

var limit = 0;
const Main = () => {
  const navigation = useNavigation<any>();

  const { user, setUser } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationLearningCount, setNotificationLearningCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const handlePostEvent = async (payload: any) => {
    if (payload.eventType === 'INSERT' && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }

    if (payload.eventType == 'DELETE' && payload.old.id) {
      setPosts((prevPosts: any) => {
        let updatedPosts = prevPosts.filter(
          (post: any) => post.id !== payload.old.id,
        );
        return updatedPosts;
      });
    }

    if (payload.eventType == 'UPDATE' && payload?.new?.id) {
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.map(post => {
          if (post.id == payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };

  // load realtime
  useEffect(() => {
    if (!user) return;

    let postChannel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        handlePostEvent,
      )
      .subscribe();

    let notificationChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*', // cả INSERT và UPDATE
          schema: 'public',
          table: 'notifications',
          filter: `receiverId=eq.${user.id}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setNotificationCount(prev => prev + 1);
          }
          if (payload.eventType === 'UPDATE' && payload.new.is_read === true) {
            setNotificationCount(prev => Math.max(prev - 1, 0));
          }
        },
      )
      .subscribe();

    let notificationLearningChannel = supabase
      .channel('notificationsLearning')
      .on(
        'postgres_changes',
        {
          event: '*', // cả INSERT và UPDATE
          schema: 'public',
          table: 'notificationsLearning',
          filter: `userId=eq.${user.id}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setNotificationLearningCount(prev => prev + 1);
          }
          if (payload.eventType === 'UPDATE' && payload.new.is_read === true) {
            setNotificationLearningCount(prev => Math.max(prev - 1, 0));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(notificationLearningChannel);
    };
  }, [user]);

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const fetchMessagesCount = async () => {
      const res = await fetchTotalUnreadMessages();
      setUnreadMessageCount(res);
    };

    //  Hàm handle khi có tin nhắn mới từ socket
    const handleNotificationNewMessage = () => {
      fetchMessagesCount();
    };

    // Hàm handle khi có người đọc tin nhắn từ socket
    const handleNotificationMessagesRead = () => {
      fetchMessagesCount();
    };

    // Lắng nghe sự kiện từ socket
    socket.on("notificationNewMessage", handleNotificationNewMessage);
    socket.on("notificationMessagesRead", handleNotificationMessagesRead);

    fetchMessagesCount();

    return () => {
      socket.off("notificationNewMessage", handleNotificationNewMessage);
      socket.off("notificationMessagesRead", handleNotificationMessagesRead);
    };
  }, [user]);

  const getPosts = async () => {
    if (!hasMore) return;

    if (!user?.id) return;

    limit += 10;

    let res = await fetchPosts(user?.id, limit);

    if (res.success) {
      if (res.data.length < limit) {
        setHasMore(false);
      }
      setPosts(prevPosts => {
        const newPosts = res.data.filter(
          (newPost: any) => !prevPosts.some(post => post.id === newPost.id),
        );
        return [...prevPosts, ...newPosts];
      });
    } else {
      console.log('Error fetching posts:', res.msg);
    }
  };

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
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Social Learning</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setNotificationCount(0);
                setNotificationLearningCount(0);
                navigation.navigate('Notification');
              }}
              activeOpacity={0.8}
            >
              <Heart size={20} color="#fff" />
              {notificationCount + notificationLearningCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount + notificationLearningCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Message')}
              activeOpacity={0.8}
            >
              <MessageCircleMore size={20} color="#fff" />
              {unreadMessageCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {unreadMessageCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Posts */}
          <View style={styles.postsContainer}>
            <FlatList
              scrollEnabled={false}
              data={posts}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <PostCard
                  item={item}
                  currentUser={user}
                  navigation={navigation}
                />
              )}
              onEndReached={() => {
                getPosts();
              }}
              onEndReachedThreshold={0}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Sparkles size={48} color="#9ca3af" />
                  </View>
                  <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
                  <Text style={styles.emptyDescription}>
                    Hãy bắt đầu chia sẻ những khoảnh khắc học tập của bạn!
                  </Text>
                </View>
              }
              ListFooterComponent={
                hasMore ? (
                  <View style={styles.loadingContainer}>
                    <Loading />
                  </View>
                ) : posts.length > 0 ? (
                  <View style={styles.endContainer}>
                    <Text style={styles.endText}>
                      Không còn bài viết nào nữa
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  actionButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#ffffff',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: verticalScale(-12),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  scrollView: {
    flex: 1,
  },
  postsContainer: {
    paddingTop: verticalScale(16),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(40),
    marginTop: verticalScale(60),
  },
  emptyIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: verticalScale(8),
  },
  emptyDescription: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: verticalScale(20),
  },
  loadingContainer: {
    marginVertical: verticalScale(30),
    alignItems: 'center',
  },
  endContainer: {
    marginBottom: verticalScale(60),
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  endText: {
    fontSize: moderateScale(16),
    color: '#6b7280',
    textAlign: 'center',
  },
});
