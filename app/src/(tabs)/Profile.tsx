import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ProfileHeader from '../screens/user/components/ProfileHeader';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { Menu, PlusSquare } from 'lucide-react-native';
import StoryHighlights from '../screens/user/components/StoryHighlights';
import ProfileTabs from '../screens/user/components/ProfileTabs';
import PhotoGrid from '../screens/user/components/PhotoGrid';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function ProfileScreen() {
  const [active, setActive] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        // colors={['#F97316', '#EC4899']}
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{user?.name}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Create')}
              activeOpacity={0.8}
            >
              <PlusSquare size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Options')}
              activeOpacity={0.8}
            >
              <Menu size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />
          <StoryHighlights />
          <ProfileTabs active={active} setActive={setActive} />
          <View style={styles.tabContent}>
            {active === 'posts' && <PhotoGrid />}
            {active === 'saved' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Chưa có bài viết đã lưu
                </Text>
              </View>
            )}
            {active === 'tagged' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Chưa có bài viết được gắn thẻ
                </Text>
              </View>
            )}
          </View>
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
  headerGradient: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(8),
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: verticalScale(-15),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(4),
    paddingBottom: verticalScale(100),
  },
  tabContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(40),
  },
  emptyStateText: {
    fontSize: moderateScale(16),
    color: '#6b7280',
    textAlign: 'center',
  },
});
