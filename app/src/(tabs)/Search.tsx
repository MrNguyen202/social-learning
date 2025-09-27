import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Heart, MessageCircleMore, Search, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { searchUsers } from '../api/user/route';
import { getSupabaseFileUrl } from '../api/image/route';

const SearchTab = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUsers(keyword);
        if (res.success) {
          setResults(res.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timeout);
  }, [keyword]);

  const renderItem = ({ item }: { item: any }) => {
    const avatarUrl = item.avatar ? getSupabaseFileUrl(item.avatar) : null;
    const handleClick = () => {
      navigation.navigate('UserFollow', { userSearch: item });
    };
    return (
      <TouchableOpacity style={styles.item} onPress={() => handleClick()}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={{ color: '#fff' }}>
              {item.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.nickname}>{item.nick_name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View className="flex justify-between items-center flex-row py-3 px-4">
        <Text className="text-3xl font-semibold">Tìm kiếm</Text>
        <View className="flex flex-row space-x-4">
          <TouchableOpacity
            className="mx-4 flex-row items-center bg-slate-100 px-3 py-2 rounded-full"
            onPress={() => navigation.navigate('RecommendFriend')}
          >
            <Text className="text-xl"> Gợi ý bạn bè</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Search box */}
      <View style={styles.searchBox}>
        <Search size={22} color="black" />
        <TextInput
          placeholder="Tìm kiếm theo tên hoặc biệt danh"
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
        />
      </View>

      {/* Results */}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {!loading && results.length === 0 && keyword ? (
        <Text style={styles.emptyText}>Không tìm thấy</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
};

export default SearchTab;

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 24,
    margin: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarFallback: {
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  nickname: {
    fontSize: 13,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
