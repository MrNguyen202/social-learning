import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAuth from '../../../hooks/useAuth';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import Button from '../../components/Button';
import { FileImage, Trash, VideoIcon } from 'lucide-react-native';
import RichTextEditor from '../../components/RichTextEditor';
import {
  getSupabaseFileUrl,
  getUserImageSrc,
  requestGalleryPermission,
} from '../../api/image/route';
import Avatar from '../../components/Avatar';
import Toast from 'react-native-toast-message';
import {
  convertFileToBase64,
  CreatePostData,
  updatePost,
} from '../../api/post/route';
import { launchImageLibrary } from 'react-native-image-picker';
import { useEffect, useRef, useState } from 'react';
import Video from 'react-native-video';
import Header from '../../components/Header';

interface FileData {
  uri: string;
  type: string;
  name: string;
  fileSize?: number;
}

const EditPost = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const route = useRoute();
  const { post }: any = route.params; // log mẫu bạn đưa ở trên
  const bodyRef = useRef(post?.content || '');
  const editorRef = useRef<{
    setText: (text: string) => void;
    setContentHTML: (html: string) => void;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<FileData | null>(null);

  useEffect(() => {
    if (post) {
      // set content vào editor
      setTimeout(() => {
        editorRef.current?.setText(post.content || '');
      }, 300);

      // set file cũ (ở Supabase)
      if (post.file) {
        setFile({
          uri: post.file, // giữ nguyên đường dẫn Supabase
          type: post.file.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
          name: post.original_name || `file_${Date.now()}`,
        });
      }
    }
  }, [post]);

  // check local file
  const isLocalFile = (file: FileData | null) => {
    if (!file) return false;
    return file.uri.startsWith('file://');
  };

  const getFileType = (file: FileData | null) => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  };

  const getFileUri = (file: FileData | null) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    // file Supabase
    return getSupabaseFileUrl(file.uri);
  };

  const onPick = async (isImage: boolean) => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Toast.show({ type: 'error', text1: 'Quyền bị từ chối' });
      return;
    }

    const mediaType = isImage ? 'photo' : 'video';
    const response = await launchImageLibrary({ mediaType, quality: 0.8 });

    if (response.didCancel) return;

    const asset = response.assets?.[0];
    if (!asset?.uri) return;

    setFile({
      uri: asset.uri,
      type: asset.type || (isImage ? 'image/jpeg' : 'video/mp4'),
      name: asset.fileName || `${isImage ? 'image' : 'video'}_${Date.now()}`,
      fileSize: asset.fileSize,
    });
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', 'Vui lòng nhập nội dung hoặc chọn file');
      return;
    }

    setLoading(true);
    try {
      let fileData = null;

      if (file && isLocalFile(file)) {
        // chỉ convert khi file mới được chọn
        const fileBase64 = await convertFileToBase64(file.uri);
        fileData = {
          fileBase64,
          fileName: file.name,
          mimeType: file.type,
        };
      } else if (file && !isLocalFile(file)) {
        // giữ lại file cũ
        fileData = {
          uri: file.uri,
          mimeType: file.type,
          fileName: file.name,
        };
      }

      const postData: CreatePostData & { id: number } = {
        id: post.id, // quan trọng, backend cần id
        content: bodyRef.current,
        userId: user?.id,
        file: fileData,
      };

      const res = await updatePost(postData);

      if (res.success) {
        Toast.show({ type: 'success', text1: 'Cập nhật thành công' });
        navigation.goBack();
      } else {
        Alert.alert(
          'Post',
          res.message || 'Có lỗi xảy ra khi cập nhật bài viết',
        );
      }
    } catch (err) {
      Alert.alert('Post', 'Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <Header title="Chỉnh sửa bài viết" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={getUserImageSrc(user?.avatar)}
              size={hp(6.5)}
              rounded={theme.radius.xxl * 100}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user?.nick_name}</Text>
              <Text style={styles.publicText}>Công khai</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor
              ref={editorRef}
              onChange={val => (bodyRef.current = val)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) === 'video' ? (
                <Video
                  style={{ flex: 1 }}
                  source={{ uri: getFileUri(file) || '' }}
                  resizeMode="cover"
                  paused={true}
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) || '' }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Trash size={20} color="white" />
              </Pressable>
            </View>
          )}

          <View style={styles.media}>
            <Text style={styles.addImageText}>Thêm vào bài viết của bạn</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <FileImage size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <VideoIcon size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={'Cập nhật bài viết'}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </View>
  );
};

export default EditPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {
    // marginTop: 10,
  },
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  imageIcon: {
    borderRadius: theme.radius.md,
  },
  file: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  video: {},
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
