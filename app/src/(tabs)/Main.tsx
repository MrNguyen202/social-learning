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
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import PostCard from '../screens/post/PostCard';
import Loading from '../components/Loading';
import LinearGradient from 'react-native-linear-gradient';

var limit = 0;
const Main = () => {
  const navigation = useNavigation<any>();

  const { user, setUser } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

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

  const handleNewNotification = async (payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.id) {
      setNotificationCount(prevCount => prevCount + 1);
    }
  };

  // load realtime
  useEffect(() => {
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
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiverId=eq.${user.id}`,
        },
        handleNewNotification,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  useEffect(() => {
    getPosts();
  }, []);

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
                navigation.navigate('Notification');
              }}
              activeOpacity={0.8}
            >
              <Heart size={20} color="#fff" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  postsContainer: {
    paddingTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
  loadingContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  endContainer: {
    marginBottom: 60,
    alignItems: 'center',
    paddingVertical: 20,
  },
  endText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
