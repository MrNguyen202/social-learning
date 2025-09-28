"use client";

import { getUserImageSrc } from "@/app/api/image/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/utils/formatTime";

type MemberSeen = {
    userId: string;
    seenAt: string;
    _id: string;
};

// Update Message type to allow memberSeens to be an array
export type Message = {
    id: string;
    content: {
        type: string;
        text: string;
        images: any[];
        file: any;
    };
    sender: {
        id: string;
        name: string;
        avatar: string;
    };
    replyTo: any;
    revoked: boolean;
    seens: MemberSeen[];
    like: any[];
    createdAt: string;
    updatedAt: string;
};

interface MessageReceiverProps {
    message: Message;
}

export default function MessageReceiver({ message }: MessageReceiverProps) {
    return (
        <div className="flex justify-start">
            <div className="max-w-2/3 min-w-16 flex items-start gap-2">
                <Avatar>
                    <AvatarImage src={getUserImageSrc(message?.sender?.avatar)} alt={message?.sender?.name} className="rounded-full" />
                    <AvatarFallback className="bg-gray-300">{message?.sender?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg shadow-md w-full">
                    <p className="text-base wrap-break-word">{message.content.text}</p>
                    <p className="text-gray-500 text-sm text-right">{formatTime(message.createdAt)}</p>
                </div>
            </div>
        </div>
    );
}
