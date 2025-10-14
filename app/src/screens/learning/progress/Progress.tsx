import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
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
  BookOpenIcon,
  HeadphonesIcon,
  MicIcon,
  TrendingUpIcon,
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

const { width: screenWidth } = Dimensions.get('window');

const skillConfig = {
  speaking: { label: 'Kỹ năng Nói', icon: MicIcon, color: '#f59e0b' },
  writing: { label: 'Kỹ năng Viết', icon: BookOpenIcon, color: '#ec4899' },
  listening: { label: 'Kỹ năng Nghe', icon: HeadphonesIcon, color: '#8b5cf6' },
};

export default function ProgressScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
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

  useEffect(() => {
    bgScale1.value = withRepeat(withTiming(1.2, { duration: 20000 }), -1, true);
    bgScale2.value = withRepeat(withTiming(1.2, { duration: 20000 }), -1, true);
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
    // giả sử API trả về tất cả các năm, bạn có thể lọc theo year hiện tại
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
    const cellSize = 18;
    const cellGap = 4;
    const topOffset = 20;
    const leftOffset = 25;

    const levelColors = [
      '#e5e7eb',
      '#fef3c7',
      '#fde68a',
      '#fbbf24',
      '#f59e0b',
      '#b45309',
    ];

    // Map dữ liệu ngày → level
    const dataMap = Object.fromEntries(data.map(d => [d.date, d]));

    // Lấy 90 ngày gần nhất
    const today = dayjs();
    const dates = Array.from({ length: 90 }).map((_, i) =>
      today.subtract(89 - i, 'day'),
    );

    // Tính chiều rộng / cao của chart
    const columns = Math.ceil(dates.length / days);
    const width = leftOffset + columns * (cellSize + cellGap);
    const height = topOffset + days * (cellSize + cellGap) + 20;

    // Tạo danh sách label tháng
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
      <Svg width={width} height={height}>
        {/* Tháng */}
        {monthLabels.map(({ name, x }, index) => (
          <SvgText
            key={`${name}-${index}`}
            x={x + 4} // căn giữa đẹp hơn
            y={12}
            fontSize={10}
            fill="#6b7280"
            fontWeight="500"
          >
            {name}
          </SvgText>
        ))}

        {/* Ô vuông mỗi ngày */}
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
              rx={4}
              fill={color}
            />
          );
        })}

        {/* Nhãn thứ (T2 → CN) */}
        {weekDays.map((d, i) => (
          <SvgText
            key={d}
            x={0}
            y={topOffset + i * (cellSize + cellGap) + cellSize / 1.4}
            fontSize={9}
            fill="#9ca3af"
          >
            {d}
          </SvgText>
        ))}
      </Svg>
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
    const { label, color, icon: Icon } = skillConfig[skillType];

    return (
      <View style={styles.skillCard}>
        <View style={styles.skillHeader}>
          <View
            style={[styles.iconContainer, { backgroundColor: `${color}20` }]}
          >
            <Icon size={20} color={color} />
          </View>
          <Text style={[styles.skillTitle, { color }]}>{label}</Text>
        </View>

        <Text style={styles.skillDescription}>
          Tiến trình trong {getPeriodLabel().toLowerCase()}
        </Text>

        {chartData.length > 0 ? (
          <GiftedAreaChart
            data={chartData}
            width={screenWidth - 24}
            height={220}
            areaChart
            curved
            isAnimated
            adjustToWidth
            color={color}
            startFillColor={`${color}50`}
            endFillColor={`${color}10`}
            xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
            yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
            initialSpacing={20}
            spacing={30}
            noOfSections={4}
            hideRules
            yAxisThickness={0}
            xAxisThickness={0}
          />
        ) : (
          <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <TrendingUpIcon size={16} color={color} />
            <Text style={styles.statText}>
              Tăng trưởng: <Text style={{ fontWeight: 'bold' }}>+12%</Text>
            </Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: color }]}>
            <Text style={styles.statLabel}>Điểm trung bình</Text>
            <Text style={[styles.statValue, { color }]}>
              {Math.round(Math.random() * 100)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const animatedStyle1 = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    transform: [{ scale: bgScale1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    transform: [{ scale: bgScale2.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={animatedStyle1} />
      <Animated.View style={animatedStyle2} />

      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}
            >
              Tiến trình học tập
            </Text>
          </View>
          <Text style={styles.headerSubtitle}>Theo dõi sự tiến bộ của bạn</Text>

          {/* Bộ lọc thời gian */}
          <View style={styles.controls}>
            {['7days', '30days', 'all'].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p as any)}
                style={[
                  styles.periodButton,
                  period === p && { backgroundColor: '#f59e0b' },
                ]}
              >
                <Text
                  style={[styles.periodText, period === p && { color: '#fff' }]}
                >
                  {p === '7days'
                    ? '7 ngày'
                    : p === '30days'
                    ? '30 ngày'
                    : 'Tất cả'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Render 3 biểu đồ kỹ năng */}
          {renderSkillCard('speaking', dataSpeaking)}
          {renderSkillCard('writing', dataWriting)}
          {renderSkillCard('listening', dataListening)}
        </View>
        <View style={styles.heatmapContainer}>
          <View style={styles.heatmapHeader}>
            <Text style={styles.heatmapTitle}>Lịch sử học tập</Text>
            <View style={styles.yearPicker}>
              {[2024, 2025].map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setYear(y)}
                  style={[
                    styles.yearOption,
                    year === y && styles.yearOptionSelected,
                  ]}
                >
                  <Text
                    style={[styles.yearText, year === y && { color: '#fff' }]}
                  >
                    Năm {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {heatmapData.length > 0 ? (
            <View style={{ alignItems: 'center' }}>
              <Heatmap data={heatmapData} />
            </View>
          ) : (
            <Text style={styles.noDataText}>
              Không có dữ liệu cho năm {year}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  periodText: { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  skillCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillTitle: { fontSize: 18, fontWeight: 'bold' },
  skillDescription: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, color: '#6b7280' },
  statBox: { padding: 8, borderLeftWidth: 3, borderRadius: 8 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  noDataText: { textAlign: 'center', color: '#9ca3af', marginVertical: 8 },
  heatmapContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heatmapTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  yearPicker: { flexDirection: 'row', gap: 8 },
  yearOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  yearOptionSelected: { backgroundColor: '#f59e0b' },
  yearText: { fontSize: 14, fontWeight: '500', color: '#374151' },
});
