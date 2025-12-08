import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Download, FileText } from "lucide-react-native";
import MessageImages from "./MessageImages";
import Video from 'react-native-video';
import getFileIconUrl from "../../../../../utils/getIconTypeAttach";

// Interface giữ nguyên
interface MessageAttachmentsProps {
  images?: { url: string; filename: string }[];
  file?: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  } | null;
}

export default function MessageAttachments({ images, file }: MessageAttachmentsProps) {
  const renderFile = () => {
    if (!file) return null;

    // Xử lý Video
    if (file.mimeType?.startsWith("video/")) {
      return (
        <View className="rounded-lg overflow-hidden w-[250px] h-[200px] bg-black mt-1 relative">
          <Video
            source={{ uri: file.url }}
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
            controls={true} 
            resizeMode="contain"
            paused={true} 
          />
        </View>
      );
    }

    return (
      <TouchableOpacity className="flex-row items-center gap-2 bg-white p-2 rounded-md border border-gray-200 mt-1 max-w-[250px]">
        <Image
          source={getFileIconUrl({ name: file.filename } as unknown as File)}
          style={{ width: 32, height: 32, resizeMode: 'contain' }}
        />
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700" numberOfLines={1}>
            {file.filename}
          </Text>
          <Text className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        </View>
        <View className="p-1.5 bg-gray-100 rounded-full">
            <Download size={16} color="#4b5563" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <MessageImages images={images || []} />
      {renderFile()}
    </View>
  );
}