import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useAuth from '../../../hooks/useAuth';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useEffect, useRef, useState } from 'react';
import { getUserData } from '../../api/user/route';
import { supabase } from '../../../lib/supabase';
import {
  addComment,
  deleteComment,
  deletePost,
  getPostById,
} from '../../api/post/route';
import { createNotification } from '../../api/notification/route';
import Loading from '../../components/Loading';
import BackButton from '../../components/BackButton';
import PostCard from './PostCard';
import { Send } from 'lucide-react-native';
import CommentItem from './components/CommentItem';
import Header from '../../components/Header';
import Toast from 'react-native-toast-message';

const PostDetail = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { postId }: any = route.params;
  const { commentId }: any = route.params;
  const { commentCount }: any = route.params;
  const { user } = useAuth();
  const [startLoading, setStartLoading] = useState(true);
  const [input, setInput] = useState('');
  const commentRef = useRef('');
  const [loading, setLoading] = useState(false);

  const [post, setPost] = useState<any>(null);

  const handleNewComment = async (payload: any) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prevPost: any) => {
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments],
        };
      });
    }
  };

  useEffect(() => {
    let commentChannel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `postId=eq.${postId}`,
        },
        handleNewComment,
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const getPostDetails = async () => {
    // fetch post details
    let res = await getPostById(postId);
    if (res.success) {
      setPost(res.data);
    }
    setStartLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current) return;
    let data = {
      userId: user?.id,
      postId: post?.id,
      content: commentRef.current,
    };
    // create comment
    setLoading(true);
    let res = await addComment(data);
    setLoading(false);
    if (res.success) {
      if (user.id != post.user.id) {
        let notify = {
          senderId: user.id,
          receiverId: post.user.id,
          title: "Đã bình luận bài viết của bạn",
          content: JSON.stringify({
            postId: post.id,
            commentId: res?.data?.id,
          }),
        };
        createNotification(notify);
      }
      setInput('');
      commentRef.current = '';
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  const onDeleteComment = async (comment: any) => {
    let res = await deleteComment(comment?.id);
    if (res.success) {
      setPost((prevPost: any) => {
        let updatedPost = { ...prevPost };
        updatedPost.comments = updatedPost.comments.filter(
          (c: any) => c.id !== comment.id,
        );
        return updatedPost;
      });
      Toast.show({
        type: 'success',
        text1: 'Xóa bình luận thành công',
        visibilityTime: 1000,
      });
    } else {
      Alert.alert('Comment', res.msg);
    }
  };

  const onDeletePost = async (item: any) => {
    // delete post
    if (!post) return;
    let res = await deletePost(post?.id);
    if (res.success) {
      Toast.show({
        type: 'success',
        text1: 'Xóa bài viết thành công',
        visibilityTime: 1000,
      });
      navigation.goBack();
    } else {
      Alert.alert('Post', res.msg);
    }
  };

  const onEditPost = async (item: any) => {
    navigation.goBack();
    navigation.navigate('EditPost', { post: item });
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ padding: wp(4), paddingTop: wp(8) }}>
          <BackButton navigation={navigation} />
        </View>
        <View
          style={[
            styles.center,
            { justifyContent: 'flex-start', marginTop: 100 },
          ]}
        >
          <Text style={styles.notFound}>Không tìm thấy bài đăng</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Bài viết" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={{ ...post }}
          currentUser={user}
          navigation={navigation}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
          commentCount={commentCount}
        />

        {/* comment input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Viết bình luận..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            value={input}
            onChangeText={text => {
              setInput(text);
              commentRef.current = text;
            }}
            editable={!loading}
          />

          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Send color={theme.colors.dark} />
            </TouchableOpacity>
          )}
        </View>

        {/* comment list */}
        <View style={{ marginVertical: 15, gap: 17 }}>
          {post?.comments?.map((comment: any) => (
            <CommentItem
              key={comment?.id}
              item={comment}
              onDelete={onDeleteComment}
              highlight={comment.id == commentId}
              canDelete={user.id == comment.user.id || user.id == post.user.id}
            />
          ))}

          {post?.comments?.length == 0 && (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Hãy là người đầu tiên bình luận
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(2.5),
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: hp(1.8),
    color: theme.colors.textDark,
    maxHeight: hp(15),
    backgroundColor: '#F5F5F5',
    textAlignVertical: 'top',
  },
  sendIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: theme.colors.dark,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    height: hp(5),
    width: hp(5.3),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.3 }],
  },
});
