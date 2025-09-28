import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Grid3X3, Bookmark, Tag } from 'lucide-react-native';

type TabId = 'posts' | 'saved' | 'tagged';

export default function ProfileTabs({
  active,
  setActive,
}: {
  active: TabId;
  setActive: (t: TabId) => void;
}) {
  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'posts', label: 'Bài viết', icon: Grid3X3 },
    { id: 'saved', label: 'Đã lưu', icon: Bookmark },
    { id: 'tagged', label: 'Được gắn thẻ', icon: Tag },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(t => {
        const IconComponent = t.icon;
        const isActive = active === t.id;
        
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActive(t.id)}
            activeOpacity={0.7}
          >
            <IconComponent 
              size={20} 
              color={isActive ? '#667eea' : '#9ca3af'} 
            />
            <Text
              style={[
                styles.tabText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {t.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f8faff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  activeText: {
    color: '#667eea',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#9ca3af',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
});