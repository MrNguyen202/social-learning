import { Text, View } from "react-native";
import { hp } from "../../../../../helpers/common";
import { formatTime } from "../../../../../helpers/formatTime";
import { getUserImageSrc } from "../../../../api/image/route";
import Avatar from "../../../../components/Avatar";


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
        <View className="flex justify-start max-w-[80%]">
            <View className="flex flex-row items-end gap-2">
                <Avatar size={hp(2.5)} uri={getUserImageSrc(message?.sender?.avatar)} />
                <View className="bg-gray-100 text-gray-800 p-3 rounded-lg shadow-md max-w-[90%]">
                    <Text className="text-base">{message.content.text}</Text>
                </View>
            </View>
        </View>
    );
}
