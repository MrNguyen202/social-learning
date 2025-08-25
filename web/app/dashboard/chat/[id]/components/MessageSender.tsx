"use client";

interface MessageSenderProps {
    message: Message;
}

type MemberSeen = {
    id: string;
    name: string;
    avatarUrl: string;
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
        avatarUrl: string;
    };
    replyTo: any;
    revoked: boolean;
    memberSeens: MemberSeen[];
    like: any[];
    createdAt: string;
    updatedAt: string;
};

interface MessageSenderProps {
    message: Message;
}

export default function MessageSender({ message }: MessageSenderProps) {
    return (
        <div className="flex justify-end">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md max-w-2/3 flex justify-end">
                <p>{message.content.text}</p>
            </div>
        </div>
    );
}
