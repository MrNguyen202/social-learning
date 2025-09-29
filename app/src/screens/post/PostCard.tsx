import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Share,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Avatar from '../../components/Avatar';
import Video from 'react-native-video';
import { theme } from '../../../constants/theme';
import { hp, stripHtmlTags, wp } from '../../../helpers/common';
import {
  Edit2,
  Forward,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash,
} from 'lucide-react-native';
import { getSupabaseFileUrl, getUserImageSrc } from '../../api/image/route';
import Loading from '../../components/Loading';
import { likePost, unlikePost } from '../../api/post/route';
import { convertToDate, formatTime } from '../../../helpers/formatTime';

const PostCard = ({
  item,
  currentUser,
  navigation,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
  commentCount,
}: any) => {
  const [likes, setLikes] = useState<{ userId: string; postId: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(item?.postLikes);
  }, []);

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    navigation.navigate('PostDetail', {
      postId: item?.id,
      commentCount: item?.comments?.[0]?.count || 0,
    });
  };

  const onLike = async () => {
    if (liked) {
      let updatedLikes = likes.filter(like => like.userId != currentUser?.id);
      setLikes([...updatedLikes]);
      let res = await unlikePost(item?.id, currentUser?.id);

      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    } else {
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await likePost(data);

      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    }
  };

  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.content) };
    if (item?.file) {
      setLoading(true);
      setLoading(false);
    }
    Share.share(content);
  };

  const handlePostDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bài viết này?', [
      {
        text: 'Hủy',
        onPress: () => console.log('modal cancelled'),
        style: 'cancel',
      },
      {
        text: 'Xóa',
        onPress: () => onDelete(item),
        style: 'destructive',
      },
    ]);
  };

  const createAt =
    convertToDate(item?.created_at) + ' ' + formatTime(item?.created_at);

  const liked = likes.filter(like => like.userId == currentUser?.id)[0]
    ? true
    : false;

  const fileUrl = item.file ? getSupabaseFileUrl(item.file) : null;
  const ext = item.file?.split('.').pop()?.toLowerCase();

  const handleClickUser = () => {
    if (item?.user?.id != currentUser.id) {
      navigation.navigate('UserFollow', { userSearch: item?.user });
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <View style={[styles.container, hasShadow && styles.shadow]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => handleClickUser()}
            activeOpacity={0.8}
          >
            <Avatar
              size={hp(4.5)}
              uri={getUserImageSrc(item?.user?.avatar)}
              rounded={theme.radius.xxl * 100}
            />
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createAt}</Text>
          </View>
        </View>

        {showMoreIcon && (
          <TouchableOpacity
            onPress={openPostDetails}
            style={styles.moreButton}
            activeOpacity={0.8}
          >
            <MoreHorizontal size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id == item?.user.id && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Edit2 size={18} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePostDelete}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Trash size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {item?.content && (
          <View style={styles.textContent}>
            <Text style={styles.contentText}>
              {stripHtmlTags(item?.content)}
            </Text>
          </View>
        )}

        {/* Media */}
        {fileUrl && ['png', 'jpg', 'jpeg', 'gif'].includes(ext) ? (
          <Image source={{ uri: fileUrl }} style={styles.mediaContent} />
        ) : fileUrl && ['mp4', 'webm', 'ogg'].includes(ext) ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: fileUrl }}
              style={styles.mediaContent}
              resizeMode="cover"
              controls
              paused={true}
            />
          </View>
        ) : null}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={onLike}
          activeOpacity={0.8}
        >
          <Heart
            size={22}
            color={liked ? '#ef4444' : '#9ca3af'}
            fill={liked ? '#ef4444' : 'transparent'}
          />
          <Text style={[styles.footerText, liked && styles.likedText]}>
            {likes?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={openPostDetails}
          activeOpacity={0.8}
        >
          <MessageCircle size={22} color="#9ca3af" />
          <Text style={styles.footerText}>
            {item?.comments?.[0]?.count || commentCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={onShare}
          activeOpacity={0.8}
        >
          {loading ? (
            <Loading size="small" />
          ) : (
            <Forward size={22} color="#9ca3af" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  shadow: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 12,
  },
  textContent: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  mediaContent: {
    width: '100%',
    height: hp(35),
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 24,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#ef4444',
  },
});
