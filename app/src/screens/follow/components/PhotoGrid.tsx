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

const { width } = Dimensions.get('window');
const ITEM_SIZE = Math.floor((width - 2) / 3);

export default function PhotoGrid({ userSearch }: { userSearch: any }) {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (!loading && userSearch?.id) {
      getPosts();
    }
  }, [userSearch?.id, loading]);

  const getPosts = async () => {
    setLoadingPost(true);
    const res = await fetchPostsByUserId(userSearch?.id);
    if (res?.success) setPosts(res.data || []);
    setLoadingPost(false);
  };

  if (loadingPost) {
    return <ActivityIndicator style={{ margin: 16 }} />;
  }

  if (!loadingPost && posts.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 2,
            borderColor: '#111',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>📷</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 12 }}>
          Chia sẻ ảnh
        </Text>
        <Text style={{ color: '#888', marginTop: 6, textAlign: 'center' }}>
          Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân của bạn.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const fileUrl = item.file ? getSupabaseFileUrl(item.file) : null;
    const ext = item.file?.split('.').pop()?.toLowerCase() || '';

    const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
    const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => console.log('Open post', item.id)}
      >
        {fileUrl && isImage ? (
          <Image source={{ uri: fileUrl }} style={styles.image} />
        ) : fileUrl && isVideo ? (
          <Video
            source={{ uri: fileUrl }}
            style={styles.image}
            resizeMode="cover"
            muted
            repeat
            paused={false} // chỉ hiển thị thumbnail, không auto-play
          />
        ) : (
          <View
            style={[
              styles.image,
              {
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f3f3',
              },
            ]}
          >
            <Text style={{ color: '#666', textAlign: 'center' }}>
              {item.content}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={item => String(item.id)}
      numColumns={3}
      renderItem={renderItem}
      initialNumToRender={15}
      windowSize={10}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  item: { width: ITEM_SIZE, height: ITEM_SIZE, margin: 0.5 },
  image: { width: '100%', height: '100%' },
});
