"use client";

import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import ChatBotAI from "./chatbot/ChatBotAI";

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isChatPage = pathname.startsWith("/dashboard/chat");

    return (
        <>
            {children}
            {!isChatPage && <ChatBotAI />}
            <ToastContainer />
        </>
    );
}
