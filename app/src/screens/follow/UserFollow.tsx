import { useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView } from 'react-native';
import ProfileHeader from './components/ProfileHeader';
import StoryHighlights from './components/StoryHighlights';
import ProfileTabs from './components/ProfileTabs';
import PhotoGrid from './components/PhotoGrid';
import Header from '../../components/Header';

export default function UserFollowScreen() {
  const route = useRoute();
  const { userSearch }: any = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header title={userSearch?.name} />
      <ProfileHeader userSearch={userSearch} />
      <StoryHighlights />
      <ProfileTabs />
      <PhotoGrid userSearch={userSearch} />
    </SafeAreaView>
  );
}
