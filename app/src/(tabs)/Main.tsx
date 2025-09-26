import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Heart, MessageCircleMore } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { getUserData } from '../api/user/route';
import { supabase } from '../../lib/supabase';
import { fetchPosts } from '../api/post/route';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import PostCard from '../screens/post/PostCard';
import Loading from '../components/Loading';

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

    // getPosts();

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
        setHasMore(false); // Không còn dữ liệu để tải thêm
      }
      setPosts(prevPosts => {
        // Loại bỏ các bài post trùng lặp dựa trên id
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
    <View className="bg-white px-4">
      {/* Header */}
      <View className="flex justify-between items-center flex-row py-4">
        <Text className="text-3xl font-semibold">Social Learning</Text>
        <View className="flex flex-row space-x-4">
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Notification')}
          >
            <Heart size={34} />
            {notificationCount > 0 && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-4"
            onPress={() => navigation.navigate('Message')}
          >
            <MessageCircleMore size={34} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        <View style={styles.grayLine}></View>

        {/* Post */}
        <View style={styles.container}>
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
            ListFooterComponent={
              hasMore ? (
                <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                  <Loading />
                </View>
              ) : (
                <View style={{ marginBottom: 60 }}>
                  <Text style={styles.noPosts}>Không còn bài viết nào nữa</Text>
                </View>
              )
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    paddingVertical: hp(2),
  },
  textInput: {
    fontSize: 16,
    width: '60%',
    color: '#FFF',
  },
  pressableNewPost: {
    marginHorizontal: wp(3),
    paddingVertical: hp(1.5),
    marginRight: wp(35),
    width: wp(80),
  },
  buttonNewPost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.grayLight,
    borderRadius: 20,
    width: wp(22),
    height: hp(4),
  },
  textButtonNewPost: {
    color: 'black',
    fontSize: 12,
    marginLeft: wp(2),
  },
  grayLine: {
    height: 5,
    backgroundColor: theme.colors.gray,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
  pill: {
    // position: 'absolute',
    // right: -10,
    // top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderStartColor: 'red',
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
