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
import React, { useRef, useState } from 'react';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Avatar from '../components/Avatar';
import { Delete, FileImage, VideoIcon } from 'lucide-react-native';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import RichTextEditor from '../components/RichTextEditor';
import useAuth from '../../hooks/useAuth';
import {
  getSupabaseFileUrl,
  getUserImageSrc,
  requestGalleryPermission,
} from '../api/image/route';
import Toast from 'react-native-toast-message';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  convertFileToBase64,
  createPost,
  CreatePostData,
} from '../api/post/route';
import Video from 'react-native-video';

interface FileData {
  uri: string;
  type: string;
  name: string;
  fileSize?: number;
}

const CreateTab = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const bodyRef = useRef('');
  const editorRef = useRef<{
    setText: (text: string) => void;
    setContentHTML: (html: string) => void;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<FileData | null>(null);

  const onPick = async (isImage: boolean) => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Toast.show({ type: 'error', text1: 'Quyền bị từ chối' });
      return;
    }

    const mediaType = isImage ? 'photo' : 'video';

    try {
      const response = await launchImageLibrary({
        mediaType,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (response.didCancel) return;
      if (response.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi khi chọn media',
          text2: response.errorMessage,
        });
        return;
      }

      const asset = response.assets?.[0];

      if (!asset?.uri) return;

      // Validate file size (max 30MB)
      const maxFileSize = 30 * 1024 * 1024; // 30MB
      if (asset.fileSize && asset.fileSize > maxFileSize) {
        Toast.show({
          type: 'error',
          text1: 'File quá lớn',
          text2: 'Vui lòng chọn file nhỏ hơn 30MB.',
        });
        return;
      }

      setFile({
        uri: asset.uri,
        type: asset.type || (isImage ? 'image/jpeg' : 'video/mp4'),
        name: asset.fileName || `${isImage ? 'image' : 'video'}_${Date.now()}`,
        fileSize: asset.fileSize,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể chọn media',
      });
    }
  };

  const isLocalFile = (file: FileData | null) => {
    if (!file) return false;
    return file.uri && file.uri.startsWith('file://');
  };

  const getFileType = (file: FileData | null) => {
    if (!file) return null;
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type.startsWith('video/')) {
      return 'video';
    }
    return 'file';
  };

  const getFileUri = (file: FileData | null) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    return getSupabaseFileUrl(file.uri);
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', 'Vui lòng nhập nội dung hoặc chọn file');
      return;
    }

    setLoading(true);

    try {
      let fileData = null;

      if (file) {
        const fileBase64 = await convertFileToBase64(file.uri);

        fileData = {
          fileBase64: fileBase64,
          fileName: file.name,
          mimeType: file.type,
        };
      }

      const postData: CreatePostData = {
        content: bodyRef.current,
        userId: user?.id,
        file: fileData,
      };

      const res = await createPost(postData);

      if (res.success) {
        setFile(null);
        bodyRef.current = '';
        editorRef.current?.setText('');
        Toast.show({ type: 'success', text1: 'Đăng bài thành công' });
        navigation.goBack();
      } else {
        Alert.alert('Post', res.message || 'Có lỗi xảy ra khi tạo bài viết');
      }
    } catch (error) {
      Alert.alert('Post', 'Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Đăng bài viết</Text>
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={getUserImageSrc(user?.avatar)}
              size={hp(6.5)}
              rounded={theme.radius.xl}
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
                <Delete size={20} color="white" />
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
          title={'Post'}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </View>
  );
};

export default CreateTab;

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
