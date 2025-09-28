"use client";

import { getUserImageSrc } from "@/app/api/image/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageSenderProps {
    message: Message;
}

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

interface MessageSenderProps {
    message: Message;
}

export default function MessageSender({ message }: MessageSenderProps) {
    return (
        <div className="flex flex-col justify-start items-end">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md max-w-2/3 flex justify-end">
                <p className="text-base wrap-break-word w-full">{message?.content.text}</p>
            </div>
        </div>
    );
}
