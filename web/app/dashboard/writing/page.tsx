import { RightSidebar } from "../components/RightSidebar";
import { MainContentWriting } from "./components/MainContentWriting";

export default function WritingPage() {
    return (
        <>
            <div className="flex-1 px-6 py-6">
                <MainContentWriting />
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
