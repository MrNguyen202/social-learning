"use client";

import ProfileFollowerHeader from "./componets/ProfileFollowerHeader";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-md pt-4 px-5 sm:max-w-2xl max-lg:max-w-3xl max-lg:m-0 lg:max-w-4xl">
      <ProfileFollowerHeader />
      {/* <StoryHighlights />
      <ProfileTabs />
      <PhotoGrid /> */}
    </div>
  );
}
