import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Plus } from 'lucide-react-native';

export default function StoryHighlights() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.highlightItem}>
          <View style={styles.highlightCircle}>
            <Image
              source={require('../../../../assets/images/default-avatar-profile-icon.jpg')}
              style={styles.highlightImage}
            />
          </View>
          <Text style={styles.highlightLabel}>🌿 Thiên nhiên</Text>
        </View>

        <TouchableOpacity style={styles.highlightItem} activeOpacity={0.7}>
          <View style={styles.addCircle}>
            <Plus size={24} color="#9ca3af" />
          </View>
          <Text style={styles.addLabel}>Mới</Text>
        </TouchableOpacity>

        {/* Có thể thêm nhiều highlight khác */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  highlightItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  highlightCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  highlightImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  addCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  addLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
});