import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Avatar from '../components/Avatar';
import { FileImage, Trash, VideoIcon } from 'lucide-react-native';
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
import LinearGradient from 'react-native-linear-gradient';

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
            <Text style={styles.headerTitle}>Tạo bài viết</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info */}
          <View style={styles.userSection}>
            <Avatar
              uri={getUserImageSrc(user?.avatar)}
              size={hp(6.5)}
              rounded={theme.radius.xxl * 100}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user?.nick_name}</Text>
              <View style={styles.publicBadge}>
                <Text style={styles.publicText}>Công khai</Text>
              </View>
            </View>
          </View>

          {/* Text Editor */}
          <View style={styles.editorSection}>
            <RichTextEditor
              ref={editorRef}
              onChange={val => (bodyRef.current = val)}
            />
          </View>

          {/* File Preview */}
          {file && (
            <View style={styles.filePreview}>
              {getFileType(file) === 'video' ? (
                <Video
                  style={styles.mediaContent}
                  source={{ uri: getFileUri(file) || '' }}
                  resizeMode="cover"
                  paused={true}
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) || '' }}
                  resizeMode="cover"
                  style={styles.mediaContent}
                />
              )}

              <Pressable style={styles.removeButton} onPress={() => setFile(null)}>
                <Trash size={18} color="white" />
              </Pressable>
            </View>
          )}

          {/* Media Picker */}
          <View style={styles.mediaSection}>
            <Text style={styles.mediaSectionTitle}>Thêm vào bài viết của bạn</Text>
            <View style={styles.mediaButtons}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => onPick(true)}
                activeOpacity={0.8}
              >
                <FileImage size={24} color="#667eea" />
                <Text style={styles.mediaButtonText}>Ảnh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => onPick(false)}
                activeOpacity={0.8}
              >
                <VideoIcon size={24} color="#667eea" />
                <Text style={styles.mediaButtonText}>Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            buttonStyle={styles.submitButton}
            title={'Đăng bài viết'}
            loading={loading}
            hasShadow={true}
            onPress={onSubmit}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateTab;

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  penIconContainer: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8faff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  publicBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  publicText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  editorSection: {
    marginBottom: 24,
    minHeight: 120,
  },
  filePreview: {
    height: hp(30),
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  mediaContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaSection: {
    backgroundColor: '#f8faff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
  },
  submitSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  submitButton: {
    height: hp(6.2),
    backgroundColor: '#667eea',
    borderRadius: 16,
  },
});