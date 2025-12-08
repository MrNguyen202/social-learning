import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import useAuth from '../../../../hooks/useAuth';
import { fetchPostsByUserId } from '../../../api/post/route';
import { getSupabaseFileUrl } from '../../../api/image/route';
import Video from 'react-native-video';
import { Camera, Heart, MessageCircle } from 'lucide-react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_SIZE = Math.floor((width - 4) / 3);

export default function PhotoGrid() {
  const { user, loading } = useAuth();
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (!loading && user?.id) {
      getPosts();
    }
  }, [user?.id, loading]);

  const getPosts = async () => {
    setLoadingPost(true);
    const res = await fetchPostsByUserId(user?.id);
    if (res?.success) setPosts(res.data || []);
    setLoadingPost(false);
  };

  if (loadingPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải bài viết...</Text>
      </View>
    );
  }

  if (!loadingPost && posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Camera size={moderateScale(48)} color="#9ca3af" />
        </View>
        <Text style={styles.emptyTitle}>Chia sẻ ảnh</Text>
        <Text style={styles.emptyDescription}>
          Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân của bạn.
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Chia sẻ ảnh đầu tiên</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openPostDetails = (item: any) => {
    navigation.navigate('PostDetail', {
      postId: item?.id,
      commentCount: item?.comments?.[0]?.count || 0,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => String(item.id)}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const fileUrl = item.file ? getSupabaseFileUrl(item.file) : null;
          const ext = item.file?.split('.').pop()?.toLowerCase();

          return (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => openPostDetails(item)}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                {fileUrl && ['png', 'jpg', 'jpeg', 'gif'].includes(ext) ? (
                  <Image source={{ uri: fileUrl }} style={styles.image} />
                ) : fileUrl && ['mp4', 'webm', 'ogg'].includes(ext) ? (
                  <View style={styles.videoContainer}>
                    <Video
                      source={{ uri: fileUrl }}
                      style={styles.image}
                      resizeMode="cover"
                      paused={true}
                    />
                    <View style={styles.videoOverlay}>
                      <Text style={styles.videoIcon}>▶</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.textPostContainer}>
                    <Text style={styles.textPostContent} numberOfLines={3}>
                      {item.content}
                    </Text>
                  </View>
                )}

                {/* Overlay với stats */}
                <View style={styles.overlay}>
                  <View style={styles.stats}>
                    <View style={styles.statItem}>
                      <Heart size={moderateScale(16)} color="#fff" />
                      <Text style={styles.statText}>0</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MessageCircle size={16} color="#fff" />
                      <Text style={styles.statText}>0</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gridContainer: {
    padding: 2,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: moderateScale(10),
  },
  textPostContainer: {
    flex: 1,
    backgroundColor: '#f8faff',
    padding: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPostContent: {
    color: '#374151',
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: verticalScale(16),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  statText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(40),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(40),
  },
  emptyIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: verticalScale(8),
  },
  emptyDescription: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(24),
  },
  shareButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(24),
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: moderateScale(14),
  },
});
