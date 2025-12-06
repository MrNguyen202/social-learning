import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Share,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Avatar from '../../components/Avatar';
import Video from 'react-native-video';
import { theme } from '../../../constants/theme';
import { stripHtmlTags } from '../../../helpers/common';
import {
  Download,
  Edit2,
  FileText,
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
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';

const getMimeType = (extension: string) => {
  switch (extension.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword'; // hoặc application/vnd.openxmlformats-officedocument.wordprocessingml.document
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'ppt':
    case 'pptx':
      return 'application/vnd.ms-powerpoint';
    case 'zip':
      return 'application/zip';
    case 'rar':
      return 'application/x-rar-compressed';
    default:
      return '*/*';
  }
};

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const onDownloadFile = async () => {
    if (!item.file) return;

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }

    setIsDownloading(true);
    const { config, fs } = ReactNativeBlobUtil;
    const fileUrl = getSupabaseFileUrl(item.file) as string;
    const fileName = item.original_name;

    // Lấy đuôi file
    const extension = item.file.split('.').pop();

    // Lấy MIME Type quan trọng
    const mimeType = getMimeType(extension || '');

    // Cấu hình đường dẫn lưu file
    // Android: Lưu vào thư mục Download để user dễ tìm
    // iOS: Lưu vào DocumentDir
    const downloadDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const path = `${downloadDir}/${fileName}`;

    const options = Platform.select({
      ios: {
        fileCache: true,
        path: path,
        // iOS cần cấu hình này để mở file sau khi tải
        notification: true,
      },
      android: {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true, // Dùng trình quản lý download của Android
          notification: true, // Hiện thông báo trên noti
          path: path,
          description: 'Đang tải tệp xuống...',
          title: fileName,
          mime: mimeType,
          mediaScannable: true,
        },
      },
    });

    if (!options) return;

    config(options)
      .fetch('GET', fileUrl)
      .then(res => {
        setIsDownloading(false);
        const filePath = res.path();
        // Sau khi tải xong
        FileViewer.open(filePath, { showOpenWithDialog: true })
          .then(() => {
            // Mở thành công
            console.log('File opened successfully');
          })
          .catch(error => {
            // Trường hợp máy không có app nào đọc được file này
            console.log('Error opening file:', error);
            Alert.alert(
              'Đã tải xong',
              `File đã được lưu tại thư mục Download.\nTên file: ${fileName}`,
              [{ text: 'OK' }],
            );
          });
      })
      .catch(errorMessage => {
        setIsDownloading(false);
        Alert.alert('Lỗi', 'Tải xuống thất bại.');
        console.error(errorMessage);
      });
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
              size={moderateScale(40)} // Thay hp(4.5)
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
            <MoreHorizontal
              size={moderateScale(20)}
              color={theme.colors.textLight}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id == item?.user.id && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Edit2 size={moderateScale(18)} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePostDelete}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Trash size={moderateScale(18)} color="#ef4444" />
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
        ) : (
          // file dạng pdf, docx, excel,...
          <TouchableOpacity
            style={styles.fileContainer}
            onPress={onDownloadFile}
            activeOpacity={0.7}
            disabled={isDownloading}
          >
            <View style={styles.fileIconBox}>
              {/* Icon đại diện file */}
              <FileText size={moderateScale(24)} color="#667eea" />
            </View>

            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.original_name || 'Tài liệu đính kèm'}
              </Text>
              <Text style={styles.fileSubText}>
                {isDownloading ? 'Đang tải...' : 'Nhấn để tải về'}
              </Text>
            </View>

            <View style={styles.downloadIconBox}>
              {isDownloading ? (
                <Loading size="small" color="#667eea" />
              ) : (
                <Download size={moderateScale(20)} color="#6b7280" />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={onLike}
          activeOpacity={0.8}
        >
          <Heart
            size={moderateScale(22)}
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
          <MessageCircle size={moderateScale(22)} color="#9ca3af" />
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
            <Forward size={moderateScale(22)} color="#9ca3af" />
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
    borderRadius: moderateScale(16),
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(16),
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
    marginBottom: verticalScale(12),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: scale(12),
    flex: 1,
  },
  username: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: verticalScale(2),
  },
  postTime: {
    fontSize: moderateScale(12),
    color: '#9ca3af',
  },
  moreButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  actionButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: verticalScale(12),
  },
  textContent: {
    marginBottom: verticalScale(12),
  },
  contentText: {
    fontSize: moderateScale(15),
    lineHeight: verticalScale(22),
    color: '#374151',
  },
  mediaContent: {
    width: '100%',
    height: verticalScale(250), // Thay thế hp(35)
    borderRadius: moderateScale(12),
    backgroundColor: '#f3f4f6',
  },
  videoContainer: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Màu nền nhẹ
    borderRadius: moderateScale(12),
    padding: scale(12),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileIconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    backgroundColor: '#e0e7ff', // Màu nền icon (tím nhạt)
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  fileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(2),
  },
  fileSubText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  downloadIconBox: {
    padding: scale(4),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: scale(24),
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  footerText: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#ef4444',
  },
});
