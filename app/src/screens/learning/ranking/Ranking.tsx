import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { getUserImageSrc } from '../../../api/image/route';
import {
  ArrowLeft,
  AwardIcon,
  CrownIcon,
  MedalIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
} from 'lucide-react-native';
import LeaderboardCard from './components/LeaderboardCard';
import { getLeaderBoardByType } from '../../../api/learning/ranking/route';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import { StyleSheet } from 'react-native';

export default function Ranking() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'practice' | 'test'>('practice');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const orangeBubbleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    transform: [
      {
        scale: withRepeat(withTiming(1.2, { duration: 20000 }), -1, true),
      },
    ],
  }));

  const pinkBubbleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    transform: [
      {
        scale: withRepeat(withTiming(1.2, { duration: 20000 }), -1, true),
      },
    ],
  }));

  useEffect(() => {
    if (!user) return;
    fetchLeaderboardData();
  }, [user, activeTab]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const res = await getLeaderBoardByType(activeTab);
      setLeaderboardData(res.data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userRank = leaderboardData.find(entry => entry.users?.id === user?.id);
  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3);

  const renderTopThree = ({ item, index }: { item: any; index: number }) => {
    const rankColor =
      index === 0
        ? ['#ffd700', '#ffa500']
        : index === 1
        ? ['#c0c0c0', '#a9a9a9']
        : ['#cd7f32', '#c68e17'];
    const height = index === 0 ? 180 : index === 1 ? 160 : 140;

    return (
      <View
        style={{
          width: 120,
          alignItems: 'center',
          marginHorizontal: 8,
        }}
      >
        <View style={{ position: 'relative', marginBottom: 12 }}>
          <LinearGradient
            colors={rankColor}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Image
              source={{ uri: getUserImageSrc(item.users?.avatar) }}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                borderWidth: 2,
                borderColor: '#fff',
              }}
              resizeMode="cover"
            />
          </LinearGradient>
          {index < 3 && (
            <View
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 4,
                borderWidth: 1,
                borderColor: '#f59e0b',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {index === 0 ? (
                <CrownIcon size={16} />
              ) : index === 1 ? (
                <MedalIcon size={16} />
              ) : (
                <AwardIcon size={16} />
              )}
            </View>
          )}
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
          }}
        >
          {item.users?.name || 'Ẩn danh'}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          {item.users?.nick_name}
        </Text>
        <LinearGradient
          colors={rankColor}
          style={{
            width: '80%',
            height: height,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
            #{item.rank}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
            {item.score}
          </Text>
          <Text style={{ fontSize: 12, color: '#fff' }}>điểm</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
            <Animated.View style={orangeBubbleStyle} />
            <Animated.View style={pinkBubbleStyle} />

            <View style={{ padding: 16 }}>
              <View style={styles.headerContainer}>
                <View style={styles.headerTopRow}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                  >
                    <ArrowLeft
                      size={18}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.backButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.headerTitle}>
                  <SparklesIcon size={28} color="#f59e0b" />
                  <Text style={styles.headerText}>Bảng Xếp Hạng</Text>
                  <SparklesIcon size={28} color="#ef4444" />
                </View>

                <Text style={styles.headerSubtitle}>
                  Thể hiện kỹ năng của bạn
                </Text>
              </View>

              {/* User Rank */}
              {userRank && (
                <View
                  style={{
                    padding: 16,
                    marginBottom: 24,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 2,
                    borderColor: '#fee2e2',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <LinearGradient
                        colors={['#f59e0b', '#ef4444']}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Image
                          source={{
                            uri: getUserImageSrc(userRank?.users?.avatar),
                          }}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 23,
                            borderWidth: 2,
                            borderColor: '#fff',
                          }}
                          resizeMode="cover"
                        />
                      </LinearGradient>
                      <View>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#1f2937',
                          }}
                        >
                          Xếp hạng của bạn{' '}
                          <StarIcon size={20} color="#ffd700" />
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6b7280' }}>
                          {userRank.users?.nick_name}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: 'bold',
                          color: '#f59e0b',
                        }}
                      >
                        #{userRank.rank}
                      </Text>
                      <Text style={{ fontSize: 16, color: '#1f2937' }}>
                        {userRank.score} điểm
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Tab Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 24,
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => setActiveTab('practice')}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 20,
                    backgroundColor:
                      activeTab === 'practice'
                        ? '#f59e0b'
                        : 'rgba(255,255,255,0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: activeTab === 'practice' ? '#fff' : '#1f2937',
                    }}
                  >
                    Luyện tập
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('test')}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 20,
                    backgroundColor:
                      activeTab === 'test'
                        ? '#f59e0b'
                        : 'rgba(255,255,255,0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: activeTab === 'test' ? '#fff' : '#1f2937',
                    }}
                  >
                    Kiểm tra
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Top Three */}
              <FlatList
                data={topThree}
                renderItem={renderTopThree}
                keyExtractor={item =>
                  item.users?.id || Math.random().toString()
                }
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 16,
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}
                style={{ marginBottom: 24 }}
              />

              {/* Rest of List */}
              <FlatList
                data={restOfList}
                renderItem={({ item, index }) => (
                  <LeaderboardCard
                    entry={item}
                    index={index + 3}
                    isCurrentUser={item.users?.id === user?.id}
                    onPress={() =>
                      navigation.navigate('UserFollow', {
                        userSearch: item.users,
                      })
                    }
                  />
                )}
                keyExtractor={item =>
                  item.users?.id || Math.random().toString()
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <TrophyIcon size={60} color="#9ca3af" />
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#6b7280',
                        textAlign: 'center',
                        marginTop: 16,
                      }}
                    >
                      Không có dữ liệu xếp hạng
                    </Text>
                  </View>
                }
              />
            </View>
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTopRow: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
