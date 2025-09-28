import { Text, View } from "react-native";

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
        <View className="flex flex-col justify-start items-end">
            <View className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md max-w-2/3 flex justify-end max-w-[80%]">
                <Text>{message?.content.text}</Text>
            </View>
        </View>
    );
}
