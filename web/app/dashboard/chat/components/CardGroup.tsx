"use client";

import { Badge } from "@/components/ui/badge";
import AvatarGroup from "./AvatarGroup";

interface User {
    id: string;
    name: string;
    avatarUrl: string;
}

interface Conversation {
    id: string;
    name: string;
    avatarUrl: string;
    members: User[];
    lastMessage: string;
}

type CardGroupProps = {
    conversation: Conversation;
    onClick: () => void;
}

export default function CardGroup({ conversation, onClick }: CardGroupProps) {
    return (
        <>
            <button onClick={onClick} className="w-full flex justify-start items-center px-4 gap-3 py-2 border-b border-gray-200 hover:cursor-pointer hover:bg-gray-200">
                <div className="min-w-[60px] flex justify-center items-center">
                    <AvatarGroup members={conversation.members} />
                </div>
                <div className="flex flex-col items-start gap-2 w-full">
                    <div className="flex items-center justify-between w-full">
                        <span className="font-semibold truncate max-w-52">{conversation.name}</span>
                        <Badge className="h-7 w-7 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0">
                            {99}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between w-full text-sm text-gray-500">
                        <span>{conversation.lastMessage}</span>
                        <span>{`14m ago`}</span>
                    </div>
                </div>
            </button>
        </>
    );
}
