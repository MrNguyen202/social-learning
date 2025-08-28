import { MainContentArea } from "./components/MainContentArea";
import { RightSidebar } from "./components/RightSidebar";

export default function DashboardPage() {
  return (
    <>
      <div className="flex-1 sm:px-6 py-6">
        <MainContentArea />
      </div>

      {/* Right Sidebar */}
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}