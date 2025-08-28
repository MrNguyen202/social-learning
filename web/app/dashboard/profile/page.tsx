import PhotoGrid from "./components/PhotoGrid";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import StoryHighlights from "./components/Story";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-md pt-4 sm:max-w-2xl lg:max-w-3xl px-5">
      <ProfileHeader />
      <StoryHighlights />
      <ProfileTabs />
      <PhotoGrid />
    </div>
  );
}
