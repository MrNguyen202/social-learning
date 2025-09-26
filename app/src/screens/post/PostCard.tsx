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
  const style = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

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
      //remove
      let updatedLikes = likes.filter(like => like.userId != currentUser?.id);
      setLikes([...updatedLikes]);
      let res = await unlikePost(item?.id, currentUser?.id);

      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    } else {
      // create
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
      // downdload file
      setLoading(true);
      // let url = await downloadFileShare(getSupabaseFileUrl(item?.file).uri);
      setLoading(false);
      // content.url = url;
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

  return (
    <View style={[styles.container, hasShadow && style]}>
      <View style={styles.header}>
        {/* user info and post time */}
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={getUserImageSrc(item?.user?.avatar)}
            rounded={theme.radius.xxl * 100}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createAt}</Text>
          </View>
        </View>

        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <MoreHorizontal
              size={hp(3)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id == item?.user.id && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Edit2 size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Trash size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.content && (
            <Text style={{ fontSize: hp(1.8) }}>
              {stripHtmlTags(item?.content)}
            </Text>
          )}
        </View>

        {/* post image, video, text */}
        {fileUrl && ['png', 'jpg', 'jpeg', 'gif'].includes(ext) ? (
          <Image source={{ uri: fileUrl }} style={styles.postMedia} />
        ) : fileUrl && ['mp4', 'webm', 'ogg'].includes(ext) ? (
          <View
            style={[
              styles.postMedia,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Video
              source={{ uri: fileUrl }}
              style={[styles.postMedia, { height: hp(35) }]}
              resizeMode="contain"
              controls
            />
          </View>
        ) : (
          <View>
            <Text style={{ color: '#666' }}>{item.original_name}</Text>
          </View>
        )}
      </View>

      {/* like, comment & share */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Heart
              size={24}
              fill={liked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <MessageCircle size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>
            {item?.comments?.[0]?.count || commentCount || 0}
          </Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Forward size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: '#000',
    marginHorizontal: wp(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
    // marginBottom: 10,
  },
  postMedia: {
    height: hp(40),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
});
