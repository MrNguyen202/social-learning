import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileTabs() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab}>
        <Text style={[styles.tabText]}>Bài viết</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14 },
  activeText: { color: '#111', fontWeight: '600' },
  inactiveText: { color: '#888' },
  underline: {
    height: 2,
    backgroundColor: '#111',
    width: '60%',
    marginTop: 6,
    borderRadius: 2,
  },
});
