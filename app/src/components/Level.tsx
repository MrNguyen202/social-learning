import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Star, Clock, Award } from 'lucide-react-native';
import { getAllLevels } from '../api/learning/route';
import { Icon } from '../../components/icons/Icon';

type Level = {
  id: number;
  icon: { name: string; color: string };
  name_vi: string;
  slug: string;
  description_vi: string;
  time_advice: string;
  name_en: string;
  description_en: string;
};

interface LevelProps {
  selectedLevel: { id: number; slug: string; name: string } | null;
  setSelectedLevel: (
    level: { id: number; slug: string; name: string } | null,
  ) => void;
}

export function Level({ selectedLevel, setSelectedLevel }: LevelProps) {
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const data = await getAllLevels();
        if (Array.isArray(data)) setLevels(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLevels();
  }, []);

  const getLevelColor = (index: number) => {
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Award size={24} color="#667eea" />
        <Text style={styles.title}>Chọn mức độ phù hợp</Text>
      </View>

      <FlatList
        data={levels}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selectedLevel?.slug === item.slug;
          const levelColor = getLevelColor(index);

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isSelected && [
                  styles.selectedCard,
                  { borderColor: levelColor },
                ],
              ]}
              onPress={() =>
                setSelectedLevel({
                  id: item.id,
                  slug: item.slug,
                  name: item.name_vi,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: levelColor + '20' },
                  ]}
                >
                  <Icon
                    name={item.icon.name}
                    color={item.icon.color}
                    size={20}
                  />
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>

              <Text
                style={[styles.cardTitle, isSelected && { color: levelColor }]}
              >
                {item.name_vi}
              </Text>

              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description_vi}
              </Text>

              <View style={styles.cardFooter}>
                <Clock size={14} color="#9ca3af" />
                <Text style={styles.cardTime}>{item.time_advice}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 6,
    padding: 16,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  selectedCard: {
    borderWidth: 2,
    backgroundColor: '#f8faff',
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    fontWeight: '500',
  },
});
