import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Header from '../../components/Header';
import useAuth from '../../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import {
  getUserImageSrc,
  requestGalleryPermission,
  uploadFile,
} from '../../api/image/route';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateUserData } from '../../api/user/route';
import Toast from 'react-native-toast-message';
import {
  Camera,
  User,
  Phone,
  MapPin,
  FileText,
  Users,
} from 'lucide-react-native';

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    nickName: user?.nick_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    gender: user?.gender ?? null,
    avatar: user?.avatar || null,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nickName: user.nick_name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        gender: user.gender ?? null,
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Toast.show({ type: 'error', text1: 'Quyền bị từ chối' });
      return;
    }

    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (response.didCancel) return;
      if (response.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi khi chọn ảnh',
          text2: response.errorMessage,
        });
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      setIsLoading(true);
      const res = await uploadFile('profiles', asset.uri, 'image');
      if (!res?.success) {
        Toast.show({
          type: 'error',
          text1: 'Upload thất bại',
          text2: res?.message,
        });
        return;
      }
      handleChange('avatar', res.data.path);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể upload ảnh',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Số điện thoại không hợp lệ',
      });
      return;
    }

    if (formData.bio && formData.bio.length > 300) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Tiểu sử không được vượt quá 300 ký tự',
      });
      return;
    }

    const updatedUser: any = {};

    if (formData.nickName !== (user?.nick_name || ''))
      updatedUser.nick_name = formData.nickName;
    if (formData.phone !== (user?.phone || ''))
      updatedUser.phone = formData.phone;
    if (formData.address !== (user?.address || ''))
      updatedUser.address = formData.address;
    if (formData.bio !== (user?.bio || '')) updatedUser.bio = formData.bio;
    if (formData.gender !== user?.gender) updatedUser.gender = formData.gender;
    if (formData.avatar !== (user?.avatar || null))
      updatedUser.avatar = formData.avatar;

    if (Object.keys(updatedUser).length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Thông báo',
        text2: 'Không có thay đổi nào để cập nhật',
      });
      navigation.goBack();
      return;
    }

    try {
      setIsLoading(true);
      await updateUserData(user?.id, updatedUser);
      setUser({ ...user, ...updatedUser });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật thành công',
      });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.message || 'Đã xảy ra lỗi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Chỉnh sửa trang cá nhân" />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: formData.avatar
                  ? getUserImageSrc(formData.avatar)
                  : undefined,
              }}
              style={styles.avatar}
            />
            <View style={styles.cameraOverlay}>
              <Camera size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Nickname */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={20} color="#667eea" />
              <Text style={styles.labelText}>Biệt danh</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.nickName}
              onChangeText={v => handleChange('nickName', v)}
              placeholder="Nhập biệt danh của bạn"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Phone size={20} color="#667eea" />
              <Text style={styles.labelText}>Số điện thoại</Text>
            </View>
            <TextInput
              keyboardType="phone-pad"
              style={styles.textInput}
              value={formData.phone}
              onChangeText={v => handleChange('phone', v)}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <MapPin size={20} color="#667eea" />
              <Text style={styles.labelText}>Địa chỉ</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.address}
              onChangeText={v => handleChange('address', v)}
              placeholder="Nhập địa chỉ của bạn"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <FileText size={20} color="#667eea" />
              <Text style={styles.labelText}>Tiểu sử</Text>
            </View>
            <TextInput
              multiline
              numberOfLines={4}
              style={[styles.textInput, styles.textArea]}
              value={formData.bio}
              onChangeText={v => handleChange('bio', v)}
              placeholder="Viết vài dòng về bản thân..."
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {formData.bio.length}/300 ký tự
            </Text>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Users size={20} color="#667eea" />
              <Text style={styles.labelText}>Giới tính</Text>
            </View>
            <View style={styles.genderContainer}>
              {[
                { label: 'Nam', value: true },
                { label: 'Nữ', value: false },
                { label: 'Khác', value: null },
              ].map(option => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => handleChange('gender', option.value)}
                  style={[
                    styles.genderOption,
                    formData.gender === option.value &&
                      styles.genderOptionActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === option.value &&
                        styles.genderOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  genderOptionTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 32,
  },
});
