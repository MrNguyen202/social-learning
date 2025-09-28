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

const { width } = Dimensions.get('window');
const ITEM_SIZE = Math.floor((width - 4) / 3);

export default function PhotoGrid() {
  const { user, loading } = useAuth();
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
          <Camera size={48} color="#9ca3af" />
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

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => String(item.id)}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const fileUrl = item.file ? getSupabaseFileUrl(item.file) : null;
          const ext = item.file?.split('.').pop()?.toLowerCase();
          
          return (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => console.log('Open post', item.id)}
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
                      <Heart size={16} color="#fff" />
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
    borderRadius: 8,
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
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: 10,
  },
  textPostContainer: {
    flex: 1,
    backgroundColor: '#f8faff',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPostContent: {
    color: '#374151',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
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
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});