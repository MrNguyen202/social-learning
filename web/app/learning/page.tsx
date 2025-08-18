import { InfoUser } from "./components/InfoUser";
import { MainContent } from "./components/MainContent";
import { Rank } from "./components/Rank";

export default function LearningPage() {
    return (
        <div className="grid grid-cols-5 gap-4 m-6 h-full">
            {/* User Info */}
            <InfoUser />

            {/* Main Content */}
            <MainContent />

            {/* Rank */}
            <Rank />
        </div>
    );
}