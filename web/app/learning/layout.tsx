import { TopHeader } from "./components/TopHeader";

export default function LearningLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header cố định cho learning */}
            <TopHeader />

            {/* Nội dung thay đổi theo từng page */}
            <main className="flex-1">{children}</main>
        </div>
    );
}