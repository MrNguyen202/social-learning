import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart, Key } from "lucide-react-native";
import MessageAttachments from "./MessageAttachments";
import { getUserImageSrc } from "../../../../api/image/route";
import { formatTime } from "../../../../../helpers/formatTime";

export default function MessageReceiver({ message, showTimestamp, showAvatar, onReply, onDelete, onLike }: any) {
    const { revoked, likes = [] } = message;
    const senderName = message.sender?.name || "Người dùng";
    const isAdmin = message.sender?.role === "admin";

    return (
        <View className="flex-row gap-2 w-full mb-1">
            {/* Avatar */}
            <View className="w-8 h-8 justify-end"> 
               {showAvatar ? (
                   <Image 
                        source={{ uri: getUserImageSrc(message.sender?.avatar) }} 
                        className="w-8 h-8 rounded-full bg-gray-300" 
                    />
               ) : <View className="w-8 h-8" />}
            </View>

            <View className="items-start gap-1 max-w-[75%]">
                {/* Tên người gửi trong Group */}
                {showAvatar && (
                    <View className="flex-row items-center gap-1 ml-1">
                        <Text className="text-[11px] text-orange-600 font-medium">{senderName}</Text>
                        {isAdmin && <Key size={10} color="#ca8a04" />}
                    </View>
                )}

                {revoked ? (
                    <View className="bg-gray-100 border border-gray-200 p-3 rounded-2xl rounded-tl-sm">
                        <Text className="text-gray-500 italic text-sm">Tin nhắn đã bị thu hồi</Text>
                    </View>
                ) : (
                    <View className={`bg-gray-100 p-3 shadow-sm border border-gray-200/50 min-w-[80px]
                        ${showAvatar ? "rounded-2xl rounded-tl-none" : "rounded-2xl rounded-tl-md"}
                        ${isAdmin ? "bg-yellow-50 border-yellow-200" : ""}
                    `}>
                        {/* Reply UI */}
                        {message.replyTo && (
                             <View className="mb-2 p-2 bg-white/60 rounded-md border-l-4 border-gray-400">
                                <Text className="font-bold text-gray-600 text-xs mb-1">
                                    {message.replyTo.sender?.name || "Người dùng"}
                                </Text>
                                <Text className="text-gray-500 text-xs" numberOfLines={1}>
                                    {message.replyTo.content?.text || "Nội dung..."}
                                </Text>
                            </View>
                        )}

                        {/* Content */}
                         <View>
                            {message.content.text ? (
                                <Text className="text-base text-gray-800">{message.content.text}</Text>
                            ) : null}
                            <MessageAttachments images={message.content?.images} file={message.content?.file} />
                        </View>

                        {/* Likes */}
                        {likes.length > 0 && (
                            <View className="absolute -bottom-2 -right-1 bg-white border border-gray-100 shadow-sm rounded-full px-1.5 py-0.5 flex-row items-center gap-1">
                                <Heart size={10} color="red" fill="red" />
                                <Text className="text-[10px] text-gray-600 font-bold">{likes.length}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Timestamp */}
                {showTimestamp && (
                    <Text className="text-[10px] text-gray-400 ml-1">{formatTime(message.createdAt)}</Text>
                )}
            </View>
        </View>
    );
}