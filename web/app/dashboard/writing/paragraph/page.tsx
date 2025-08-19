import { RightSidebar } from "../../components/RightSidebar";
import { MainContentParagraph } from "./components/MainContentParagraph";

export default function Page() {
    return (
        <>
            <div className="flex-1 px-6 py-6">
                <MainContentParagraph />
            </div>
            {/* Right Sidebar */}
            <div className="w-90 p-6 hidden xl:block">
                <div className="sticky top-24">
                    <RightSidebar />
                </div>
            </div>
        </>
    )
}
