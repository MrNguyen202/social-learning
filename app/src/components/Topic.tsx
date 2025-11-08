import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Hash, Sparkles } from 'lucide-react-native';
import { getAllTopics } from '../api/learning/route';
import { Icon } from '../../components/icons/Icon';

type Topic = {
  id: number;
  icon: { name: string; color: string };
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi: string;
  description_en: string;
};

type TopicProps = {
  selectedTopic: { id: number; slug: string; name: string } | null;
  setSelectedTopic: (
    topic: { id: number; slug: string; name: string } | null,
  ) => void;
};

export function Topic({ selectedTopic, setSelectedTopic }: TopicProps) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getAllTopics();
        if (Array.isArray(data)) setTopics(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTopics();
  }, []);

  const getTopicColor = (index: number) => {
    const colors = [
      '#f59e0b',
      '#10b981',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#f97316',
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Hash size={24} color="#667eea" />
        <Text style={styles.title}>Chọn chủ đề yêu thích</Text>
      </View>

      <FlatList
        data={topics}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selectedTopic?.slug === item.slug;
          const topicColor = getTopicColor(index);

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isSelected && [
                  styles.selectedCard,
                  { borderColor: topicColor },
                ],
              ]}
              onPress={() =>
                setSelectedTopic({
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
                    { backgroundColor: topicColor + '20' },
                  ]}
                >
                  <Icon
                    name={item.icon.name}
                    color={item.icon.color}
                    size={20}
                  />
                </View>
                {isSelected && (
                  <View
                    style={[
                      styles.selectedBadge,
                      { backgroundColor: topicColor },
                    ]}
                  >
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>

              <Text
                style={[styles.cardTitle, isSelected && { color: topicColor }]}
              >
                {item.name_vi}
              </Text>

              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description_vi}
              </Text>
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
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
