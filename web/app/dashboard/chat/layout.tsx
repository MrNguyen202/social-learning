import ListConversation from "./components/ListConversation";


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full max-h-[calc(100vh-66px)]">
            {/* List Conversations */}
            <div className="h-full min-w-sm border-r border-gray-200">
                <ListConversation />
            </div>

            {/* Main Chat Area */}
            <div className="w-full">{children}</div>
        </div>
    );
}