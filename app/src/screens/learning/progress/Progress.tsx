import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { LineChart as GiftedAreaChart } from 'react-native-gifted-charts';
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Mic,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Flame,
  Star,
} from 'lucide-react-native';
import useAuth from '../../../../hooks/useAuth';
import {
  getActivityHeatmap,
  statisticsScoreListening,
  statisticsScoreSpeaking,
  statisticsScoreWriting,
} from '../../../api/learning/score/route';
import { useNavigation } from '@react-navigation/native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import dayjs from 'dayjs';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const skillConfig = {
  speaking: {
    label: 'Kỹ năng Nói',
    icon: Mic,
    color: '#45B7D1',
    gradient: ['#45B7D1', '#6BC5E8'],
    lightColor: '#E8F6FF',
  },
  writing: {
    label: 'Kỹ năng Viết',
    icon: BookOpen,
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    lightColor: '#FFE8E8',
  },
  listening: {
    label: 'Kỹ năng Nghe',
    icon: Headphones,
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6DD5DB'],
    lightColor: '#E8FFFE',
  },
};

export default function ProgressScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState<'7days' | '30days' | 'all'>('7days');
  const [loading, setLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  // Mỗi kỹ năng có data riêng
  const [dataSpeaking, setDataSpeaking] = useState<any[]>([]);
  const [dataWriting, setDataWriting] = useState<any[]>([]);
  const [dataListening, setDataListening] = useState<any[]>([]);

  const bgScale1 = useSharedValue(1);
  const bgScale2 = useSharedValue(1);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    bgScale1.value = withRepeat(withTiming(1.1, { duration: 3000 }), -1, true);
    bgScale2.value = withRepeat(withTiming(1.1, { duration: 4000 }), -1, true);
    headerOpacity.value = withTiming(4, { duration: 1000 });
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchData();
      fetchDataHeatmap();
    }
  }, [user?.id, period, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [speakingRes, writingRes, listeningRes] = await Promise.all([
        statisticsScoreSpeaking(user.id, period),
        statisticsScoreWriting(user.id, period),
        statisticsScoreListening(user.id, period),
      ]);

      const normalize = (res: any) =>
        (res.data || []).map((d: any) => ({
          value: Number(d.total),
          label: d.day.slice(5),
        }));

      setDataSpeaking(normalize(speakingRes[0]));
      setDataWriting(normalize(writingRes[0]));
      setDataListening(normalize(listeningRes[0]));
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataHeatmap = async () => {
    setLoading(true);
    const res = await getActivityHeatmap(user?.id);
    const filtered = res.filter(
      (item: any) => new Date(item.date).getFullYear() === year,
    );

    const processedData = filtered.map((item: any) => ({
      date: item.date,
      count: item.count,
      level: Math.min(Math.ceil(item.count / 3), 4),
    }));

    setHeatmapData(processedData);
    setLoading(false);
  };

  const Heatmap = ({ data }: { data: any[] }) => {
    const days = 7;
    const cellSize = 16;
    const cellGap = 3;
    const topOffset = 25;
    const leftOffset = 30;

    const levelColors = [
      '#f3f4f6',
      '#ddd6fe',
      '#c4b5fd',
      '#a78bfa',
      '#8b5cf6',
      '#7c3aed',
    ];

    const dataMap = Object.fromEntries(data.map(d => [d.date, d]));
    const today = dayjs();
    const dates = Array.from({ length: 91 }).map((_, i) =>
      today.subtract(90 - i, 'day'),
    );

    const columns = Math.ceil(dates.length / days);
    const width = leftOffset + columns * (cellSize + cellGap) + 20;
    const height = topOffset + days * (cellSize + cellGap) + 30;

    const monthLabels: { name: string; x: number }[] = [];
    let prevMonth = '';
    dates.forEach((date, i) => {
      const monthName = date.format('MMM');
      if (monthName !== prevMonth) {
        const week = Math.floor(i / days);
        monthLabels.push({
          name: monthName,
          x: leftOffset + week * (cellSize + cellGap),
        });
        prevMonth = monthName;
      }
    });

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <View style={styles.heatmapWrapper}>
        <Svg width={width} height={height}>
          {/* Month labels */}
          {monthLabels.map(({ name, x }, index) => (
            <SvgText
              key={`${name}-${index}`}
              x={x + 8}
              y={15}
              fontSize={11}
              fill="#6b7280"
              fontWeight="600"
            >
              {name}
            </SvgText>
          ))}

          {/* Day cells */}
          {dates.map((date, i) => {
            const week = Math.floor(i / days);
            const day = i % days;
            const iso = date.format('YYYY-MM-DD');
            const level = dataMap[iso]?.level ?? 0;
            const color = levelColors[Math.min(level, levelColors.length - 1)];

            return (
              <Rect
                key={iso}
                x={leftOffset + week * (cellSize + cellGap)}
                y={topOffset + day * (cellSize + cellGap)}
                width={cellSize}
                height={cellSize}
                rx={3}
                fill={color}
                stroke={level > 0 ? '#8b5cf6' : '#e5e7eb'}
                strokeWidth={level > 0 ? 0.5 : 0.3}
              />
            );
          })}

          {/* Week day labels */}
          {weekDays.map((d, i) => (
            <SvgText
              key={d}
              x={5}
              y={topOffset + i * (cellSize + cellGap) + cellSize / 1.3}
              fontSize={10}
              fill="#9ca3af"
              fontWeight="500"
            >
              {d}
            </SvgText>
          ))}
        </Svg>

        {/* Legend */}
        <View style={styles.heatmapLegend}>
          <Text style={styles.legendText}>Ít</Text>
          <View style={styles.legendDots}>
            {levelColors.slice(0, 5).map((color, i) => (
              <View
                key={i}
                style={[styles.legendDot, { backgroundColor: color }]}
              />
            ))}
          </View>
          <Text style={styles.legendText}>Nhiều</Text>
        </View>
      </View>
    );
  };

  const getPeriodLabel = () => {
    if (period === '7days') return '7 ngày qua';
    if (period === '30days') return '30 ngày qua';
    return 'Tất cả thời gian';
  };

  const renderSkillCard = (
    skillType: keyof typeof skillConfig,
    chartData: any[],
  ) => {
    const {
      label,
      color,
      icon: Icon,
      gradient,
      lightColor,
    } = skillConfig[skillType];
    const totalScore = chartData.reduce((sum, item) => sum + item.value, 0);
    const avgScore =
      chartData.length > 0 ? Math.round(totalScore / chartData.length) : 0;
    const growth = Math.round(Math.random() * 20 + 5); // Mock growth

    return (
      <View style={styles.skillCard}>
        <LinearGradient
          colors={[lightColor, '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.skillCardGradient}
        >
          <View style={styles.skillHeader}>
            <View style={styles.skillHeaderLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${color}20` },
                ]}
              >
                <Icon size={24} color={color} />
              </View>
              <View>
                <Text style={styles.skillTitle}>{label}</Text>
                <Text style={styles.skillSubtitle}>{getPeriodLabel()}</Text>
              </View>
            </View>

            <View style={styles.skillStats}>
              <View style={styles.statBadge}>
                <Star size={14} color="#fbbf24" />
                <Text style={styles.statBadgeText}>{avgScore}</Text>
              </View>
            </View>
          </View>

          {chartData.length > 0 ? (
            <View style={styles.chartContainer}>
              <GiftedAreaChart
                data={chartData}
                width={screenWidth - 64}
                height={180}
                areaChart
                curved
                isAnimated
                animationDuration={1200}
                color={color}
                startFillColor={`${color}40`}
                endFillColor={`${color}10`}
                startOpacity={0.8}
                endOpacity={0.1}
                xAxisLabelTextStyle={{
                  color: '#9ca3af',
                  fontSize: 11,
                  fontWeight: '500',
                }}
                yAxisTextStyle={{
                  color: '#9ca3af',
                  fontSize: 11,
                  fontWeight: '500',
                }}
                initialSpacing={15}
                spacing={35}
                noOfSections={3}
                hideRules
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#f3f4f6"
                thickness={3}
                hideDataPoints={false}
                dataPointsColor={color}
                dataPointsRadius={4}
                focusEnabled
                showStripOnFocus
                stripColor={color}
                stripOpacity={0.2}
                stripWidth={2}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <BarChart3 size={32} color="#d1d5db" />
              <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
              <Text style={styles.noDataSubtext}>
                Bắt đầu luyện tập để xem tiến trình
              </Text>
            </View>
          )}

          <View style={styles.skillFooter}>
            <View style={styles.footerStat}>
              <TrendingUp size={16} color="#10b981" />
              <Text style={styles.footerStatText}>
                <Text style={styles.footerStatValue}>+{growth}%</Text> tăng
                trưởng
              </Text>
            </View>

            <View style={styles.footerStat}>
              <Target size={16} color={color} />
              <Text style={styles.footerStatText}>
                Mục tiêu: <Text style={styles.footerStatValue}>85 điểm</Text>
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const animatedStyle1 = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -150,
    right: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    transform: [{ scale: bgScale1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    transform: [{ scale: bgScale2.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  if (
    loading &&
    !dataSpeaking.length &&
    !dataWriting.length &&
    !dataListening.length
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <BarChart3 size={48} color="#667eea" />
          </View>
          <ActivityIndicator
            size="large"
            color="#667eea"
            style={styles.spinner}
          />
          <Text style={styles.loadingTitle}>Đang tải tiến trình...</Text>
          <Text style={styles.loadingDescription}>
            Vui lòng chờ trong giây lát
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={animatedStyle1} />
      <Animated.View style={animatedStyle2} />

      {/* Header với gradient */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#DB2777']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View>
              <Text style={styles.headerTitle}>Tiến trình học tập</Text>
              <Text style={styles.headerSubtitle}>
                Theo dõi sự tiến bộ của bạn
              </Text>
            </View>
          </View>

          <View style={styles.headerRight} />
        </Animated.View>
      </LinearGradient>
      <View style={styles.contentArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Period Filter */}
          <View style={styles.filterContainer}>
            <View style={styles.filterHeader}>
              <Calendar size={20} color="#667eea" />
              <Text style={styles.filterTitle}>Khoảng thời gian</Text>
            </View>

            <View style={styles.filterButtons}>
              {[
                { key: '7days', label: '7 ngày' },
                { key: '30days', label: '30 ngày' },
                { key: 'all', label: 'Tất cả' },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPeriod(key as any)}
                  style={[
                    styles.filterButton,
                    period === key && styles.filterButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      period === key && styles.filterButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skill Cards */}
          {renderSkillCard('writing', dataWriting)}
          {renderSkillCard('listening', dataListening)}
          {renderSkillCard('speaking', dataSpeaking)}

          {/* Heatmap Section */}
          <View style={styles.heatmapContainer}>
            <View style={styles.heatmapHeader}>
              <View style={styles.heatmapHeaderLeft}>
                <Flame size={20} color="#8b5cf6" />
                <Text style={styles.heatmapTitle}>Lịch sử học tập</Text>
              </View>

              <View style={styles.yearPicker}>
                {[2024, 2025].map(y => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setYear(y)}
                    style={[
                      styles.yearButton,
                      year === y && styles.yearButtonActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.yearButtonText,
                        year === y && styles.yearButtonTextActive,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.heatmapDescription}>
              Hoạt động học tập trong năm {year}
            </Text>

            {heatmapData.length > 0 ? (
              <Heatmap data={heatmapData} />
            ) : (
              <View style={styles.noHeatmapData}>
                <Calendar size={32} color="#d1d5db" />
                <Text style={styles.noDataText}>
                  Không có dữ liệu cho năm {year}
                </Text>
                <Text style={styles.noDataSubtext}>
                  Bắt đầu học để tạo lịch sử hoạt động
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  headerRight: {
    width: 40,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -14,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  skillCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  skillCardGradient: {
    padding: 20,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  skillSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  skillStats: {
    alignItems: 'flex-end',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  chartContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  skillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerStatText: {
    fontSize: 13,
    color: '#6b7280',
  },
  footerStatValue: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  heatmapContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heatmapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heatmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  heatmapDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  yearPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  yearButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  yearButtonTextActive: {
    color: '#ffffff',
  },
  heatmapWrapper: {
    alignItems: 'center',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  legendDots: {
    flexDirection: 'row',
    gap: 3,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  noHeatmapData: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  bottomSpacing: {
    height: 32,
  },
});
