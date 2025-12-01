import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertCircle, Heart } from "lucide-react-native";
import MessageAttachments from "./MessageAttachments";
import { formatTime } from "../../../../../helpers/formatTime";

// Component Audio Player custom cho mobile
const MobileAudioPlayer = ({ src }: { src: string }) => (
    <View className="bg-blue-200 p-2 rounded-md"><Text>Audio Player Here</Text></View>
);

export default function MessageSender({ message, onRetry, showTimestamp, isLastInSequence, onReply, onRevoke, onDelete, onLike }: any) {
    const { status, createdAt, revoked, likes = [] } = message;
    const isSent = !status || status === "sent";
    
    // Logic Long Press để mở menu option
    const handleLongPress = () => {
        // Trên mobile nên dùng BottomSheet hoặc Modal để hiển thị Option Menu
        console.log("Open Options Menu");
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.9} 
            onLongPress={handleLongPress}
            className={`flex-row gap-2 justify-end items-end w-full mb-1`}
        >
            <View className="items-end gap-1 max-w-[75%]">
                {revoked ? (
                    <View className="bg-blue-100 p-3 rounded-2xl rounded-tr-sm border border-blue-200">
                         <Text className="text-blue-800 italic text-sm">Tin nhắn đã bị thu hồi</Text>
                    </View>
                ) : (
                    <View className={`bg-blue-100 p-3 rounded-2xl shadow-sm min-w-[80px]
                        ${status === "sending" ? "opacity-60" : "opacity-100"}
                        ${status === "error" ? "bg-red-50 border border-red-300" : ""}
                        ${!showTimestamp ? "rounded-br-sm" : "rounded-br-2xl"}
                    `}>
                        {/* Reply UI */}
                        {message.replyTo && (
                            <View className="mb-2 p-2 bg-white/50 rounded-md border-l-4 border-blue-400">
                                <Text className="font-bold text-blue-700 text-xs mb-1">
                                    {message.replyTo.sender?.name || "Người dùng"}
                                </Text>
                                <Text className="text-blue-900/70 text-xs" numberOfLines={1}>
                                    {message.replyTo.content?.text || "File/Hình ảnh"}
                                </Text>
                            </View>
                        )}

                        {/* Content */}
                        {message.content.type === "audio" && message.content.file ? (
                            <MobileAudioPlayer src={message.content.file.url} />
                        ) : (
                            <View>
                                {message.content.text ? (
                                    <Text className="text-base text-gray-800">{message.content.text}</Text>
                                ) : null}
                                <MessageAttachments images={message.content.images} file={message.content.file} />
                            </View>
                        )}
                        
                        {/* Likes */}
                        {!revoked && likes.length > 0 && (
                            <View className="absolute -bottom-2 -left-2 bg-white border border-gray-100 shadow-sm rounded-full px-1.5 py-0.5 flex-row items-center gap-1">
                                <Heart size={10} color="red" fill="red" />
                                <Text className="text-[10px] text-gray-600 font-bold">{likes.length}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Status Text */}
                {(status === "sending" || status === "error" || (isSent && showTimestamp)) && (
                    <View className="flex-row items-center gap-1 pr-1">
                        {status === "sending" && <Text className="text-[10px] text-gray-400">Đang gửi...</Text>}
                        {status === "error" && (
                            <TouchableOpacity onPress={onRetry} className="flex-row items-center gap-1">
                                <AlertCircle size={10} color="red" />
                                <Text className="text-[10px] text-red-500">Lỗi</Text>
                            </TouchableOpacity>
                        )}
                        {isSent && showTimestamp && (
                            <Text className="text-[10px] text-gray-400">{formatTime(createdAt)}</Text>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}