import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, PlusCircle, Target, BookOpen, Lightbulb, SquarePlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getRoadmapByUserId } from '../../../api/learning/roadmap/route';
import CreatePathModal from './components/CreatePathModal';
import useAuth from '../../../../hooks/useAuth';

const RoadMap = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getRoadmapByUserId(user.id);
        setPaths(res || []);
      } catch (error) {
        console.error('Error fetching learning paths:', error);
        Alert.alert(
          'Lỗi',
          'Không thể tải lộ trình học. Vui lòng thử lại sau.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleRouteClick = (pathId: string) => {
    navigation.navigate('RoadmapDetail', { pathId });
  };

  const handleModalClose = () => {
    setOpenModal(false);
    // Refresh data after creating new path
    if (user.id) {
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRoadmapByUserId(user.id);
      setPaths(res || []);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Lộ trình học tập</Text>
            <Text style={styles.headerSubtitle}>
              Xây dựng lộ trình cá nhân hóa
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setOpenModal(true)}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <SquarePlus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.contentArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Đang tải lộ trình học...</Text>
            </View>
          ) : paths.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <BookOpen size={64} color="#d1d5db" />
              </View>
              <Text style={styles.emptyText}>Bạn chưa có lộ trình học nào.</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setOpenModal(true)}
                activeOpacity={0.8}
              >
                <PlusCircle size={20} color="#fff" />
                <Text style={styles.createButtonText}>Tạo lộ trình mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pathsContainer}>
              {paths.map((path) => (
                <TouchableOpacity
                  key={path.id}
                  style={styles.pathCard}
                  onPress={() => handleRouteClick(path.id)}
                  activeOpacity={0.9}
                >
                  {/* Completed Badge */}
                  {(path.isCompleted || path.currentweek >= path.totalweeks) && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>ĐÃ HOÀN THÀNH</Text>
                    </View>
                  )}

                  {/* Path Name */}
                  <LinearGradient
                    colors={['#10b981', '#059669', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pathTitleGradient}
                  >
                    <Text style={styles.pathTitle}>
                      {path?.pathName_vi}
                    </Text>
                  </LinearGradient>

                  {/* Info Circles */}
                  <View style={styles.infoContainer}>
                    {/* Goal */}
                    <View style={styles.infoItem}>
                      <View style={styles.iconLabel}>
                        <Target size={16} color="#10b981" />
                        <Text style={styles.infoLabel}>Mục tiêu</Text>
                      </View>
                      <View style={[styles.infoCircle, styles.goalCircle]}>
                        <Text style={styles.infoText} numberOfLines={3}>
                          {path?.goal_vi || '—'}
                        </Text>
                      </View>
                    </View>

                    {/* Field */}
                    <View style={styles.infoItem}>
                      <View style={styles.iconLabel}>
                        <BookOpen size={16} color="#3b82f6" />
                        <Text style={styles.infoLabel}>Lĩnh vực</Text>
                      </View>
                      <View style={[styles.infoCircle, styles.fieldCircle]}>
                        <Text style={styles.infoText} numberOfLines={2}>
                          {path?.field_vi || '—'}
                        </Text>
                      </View>
                    </View>

                    {/* Skills */}
                    <View style={styles.infoItem}>
                      <View style={styles.iconLabel}>
                        <Lightbulb size={16} color="#f59e0b" />
                        <Text style={styles.infoLabel}>Kỹ năng</Text>
                      </View>
                      <View style={[styles.infoCircle, styles.skillCircle]}>
                        <Text style={styles.infoText} numberOfLines={3}>
                          {path?.targetSkills?.join(', ') || '—'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Tiến độ học tập</Text>
                      <Text style={styles.progressText}>
                        Tuần {path?.currentweek || 1} / {path?.totalWeeks || 12}
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <LinearGradient
                          colors={['#3b82f6', '#8b5cf6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${((path?.currentweek || 1) / (path?.totalWeeks || 12)) * 100}%`
                            }
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.weekDotsContainer}>
                      {(() => {
                        const maxDots = 8;
                        const currentWeek = path?.currentweek || 1;
                        const totalWeeks = path?.totalWeeks || 12;

                        // Trường hợp 1: Tổng số tuần nhỏ hơn hoặc bằng 8 -> Hiển thị tất cả
                        if (totalWeeks <= maxDots) {
                          return Array.from({ length: totalWeeks }, (_, i) => {
                            const week = i + 1;
                            const isCompleted = week < currentWeek;
                            const isCurrent = week === currentWeek;
                            return (
                              <View
                                key={week}
                                style={[
                                  styles.weekDot,
                                  isCompleted && styles.weekDotCompleted,
                                  isCurrent && styles.weekDotCurrent,
                                ]}
                              />
                            );
                          });
                        }

                        // Trường hợp 2: Tổng số tuần lớn hơn 8 -> Dùng logic "cửa sổ trượt"
                        const offset = 5; // Cố gắng giữ tuần hiện tại ở vị trí thứ 6 (sau 5 chấm)

                        // Tính toán tuần bắt đầu, đảm bảo không nhỏ hơn 1
                        let startWeek = Math.max(1, currentWeek - offset);

                        // Điều chỉnh lại tuần bắt đầu nếu nó đẩy cửa sổ đi quá tổng số tuần
                        startWeek = Math.max(1, Math.min(startWeek, totalWeeks - maxDots + 1));

                        const endWeek = startWeek + maxDots - 1;

                        const dots = [];

                        // Hiển thị số tuần bị "che" ở trước
                        const leadingDots = startWeek - 1;
                        if (leadingDots > 0) {
                          dots.push(<Text key="lead" style={styles.moreWeeks}>+{leadingDots}</Text>);
                        }
                        return dots;
                      })()}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Create Path Modal */}
      <CreatePathModal
        visible={openModal}
        onClose={handleModalClose}
        userId={user.id}
      />
    </SafeAreaView>
  );
};

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
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pathsContainer: {
    gap: 16,
  },
  pathCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
    zIndex: 10,
  },
  completedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pathTitleGradient: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconLabel: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoCircle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  goalCircle: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  fieldCircle: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  skillCircle: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  infoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  weekDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
  },
  weekDotCompleted: {
    backgroundColor: '#10b981',
  },
  weekDotCurrent: {
    backgroundColor: '#8b5cf6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moreWeeks: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
});

export default RoadMap;