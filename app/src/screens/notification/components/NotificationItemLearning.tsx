import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { convertToDate } from '../../../../helpers/formatTime';
import { markNotificationLearningAsRead } from '../../../api/notification/route';
import { BookOpen } from 'lucide-react-native';

const NotificationItemLearning = ({ item, navigation, onRead }: any) => {
  const handleClick = async () => {
    if (!item.is_read) {
      await markNotificationLearningAsRead(item.id);
      onRead?.(item.id);
    }

    if (item.personalVocabId) {
      navigation.navigate('VocabularyDetail', {
        personalVocabId: item.personalVocabId,
      });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !item.is_read && styles.unread]}
      onPress={handleClick}
      activeOpacity={0.8}
    >
      <View style={styles.icon}>
        <BookOpen size={20} color="#667eea" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.time}>{convertToDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItemLearning;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 10,
  },
  unread: {
    backgroundColor: '#f8faff',
    borderColor: '#dbeafe',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  textContainer: { gap: 4 },
  title: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  content: { fontSize: 13, color: '#6b7280' },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
