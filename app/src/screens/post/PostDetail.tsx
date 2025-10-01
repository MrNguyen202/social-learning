import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
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
import PostCard from './PostCard';
import { Send, MessageSquare } from 'lucide-react-native';
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
    setLoading(true);
    let res = await addComment(data);
    setLoading(false);
    if (res.success) {
      if (user.id != post.user.id) {
        let notify = {
          senderId: user.id,
          receiverId: post.user.id,
          title: 'Đã bình luận bài viết của bạn',
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loading />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Bài viết" />
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIconContainer}>
            <MessageSquare size={48} color="#9ca3af" />
          </View>
          <Text style={styles.notFoundTitle}>Không tìm thấy bài đăng</Text>
          <Text style={styles.notFoundDescription}>
            Bài viết có thể đã bị xóa hoặc không tồn tại
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: wp(3) }}>
        <Header title="Bài viết" />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Post Card */}
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

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Bình luận ({post?.comments?.length || 0})
          </Text>

          {post?.comments?.length === 0 ? (
            <View style={styles.noCommentsContainer}>
              <MessageSquare size={32} color="#9ca3af" />
              <Text style={styles.noCommentsText}>
                Hãy là người đầu tiên bình luận
              </Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {post?.comments?.map((comment: any) => (
                <CommentItem
                  key={comment?.id}
                  item={comment}
                  onDelete={onDeleteComment}
                  highlight={comment.id == commentId}
                  canDelete={
                    user.id == comment.user.id || user.id == post.user.id
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Viết bình luận..."
            placeholderTextColor="#9ca3af"
            multiline
            value={input}
            onChangeText={text => {
              setInput(text);
              commentRef.current = text;
            }}
            editable={!loading}
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={onNewComment}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Loading size="small" />
            ) : (
              <Send
                size={18}
                color={!input.trim() || loading ? '#9ca3af' : '#667eea'}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  notFoundIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  notFoundDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  commentsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  commentsList: {
    gap: 16,
  },
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
    maxHeight: 100,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  sendButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
  },
});
