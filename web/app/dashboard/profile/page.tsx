import PhotoGrid from "./components/PhotoGrid";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import StoryHighlights from "./components/Story";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-xl pt-8 sm:max-w-3xl">
        <ProfileHeader />
        <StoryHighlights />
        <ProfileTabs />
        <PhotoGrid />
    </div>
  );
}
