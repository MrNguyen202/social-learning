import { InfoUser } from "./components/InfoUser";
import { MainContent } from "./components/MainContent";
import { Rank } from "./components/Rank";
import { TopHeader } from "./components/TopHeader";

export default function LearningPage() {
    return (
        <div className="min-h-screen">
            {/* Top header */}
            <TopHeader />

            <div className="grid grid-cols-5 gap-4 m-6">
                {/* User Info */}
                <InfoUser />

                {/* Main Content */}
                <MainContent />

                {/* Rank */}
                <Rank />
            </div>
        </div>
    );
}