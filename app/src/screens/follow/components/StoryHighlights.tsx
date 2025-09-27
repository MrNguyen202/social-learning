import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function StoryHighlights() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        <View style={styles.item}>
          <Image
            source={require('../../../../assets/images/default-avatar-profile-icon.jpg')}
            style={styles.highlightAvatar}
          />
          <Text style={styles.label}>🌿</Text>
        </View>

        <View style={styles.item}>
          <TouchableOpacity style={styles.addCircle}>
            <Text style={{ fontSize: 20 }}>+</Text>
          </TouchableOpacity>
          <Text style={[styles.label, { color: '#888' }]}>Mới</Text>
        </View>

        {/* map thêm item nếu cần */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  item: { width: 68, alignItems: 'center', marginRight: 10 },
  highlightAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, marginTop: 6, textAlign: 'center' },
});
