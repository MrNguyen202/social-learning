// App.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const data = [
  { day: '2025-10-10', total: 3 },
  { day: '2025-10-11', total: 5 },
  { day: '2025-10-12', total: 2 },
  { day: '2025-10-13', total: 8 },
  { day: '2025-10-14', total: 6 },
];

// Chuyển đổi data sang format LineChart yêu cầu
const chartData = data.map(item => ({
  value: item.total,
  label: item.day.slice(5), // lấy phần '10-10', '10-11', ...
}));

export default function ProgressPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê doanh thu 7 ngày gần nhất</Text>

      <LineChart
        data={chartData}
        width={320}
        height={220}
        curved
        hideDataPoints={false}
        color="#4F46E5"
        thickness={3}
        areaChart
        startFillColor="rgba(79, 70, 229, 0.3)"
        endFillColor="rgba(79, 70, 229, 0.05)"
        xAxisLabelTextStyle={{ color: '#666', fontSize: 12 }}
        yAxisTextStyle={{ color: '#666', fontSize: 12 }}
        initialSpacing={20}
        spacing={40}
        hideRules={false}
        rulesColor="#EEE"
        yAxisThickness={0}
        xAxisThickness={0}
        noOfSections={4}
        yAxisLabelSuffix="đ"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
});
