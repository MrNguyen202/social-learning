import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import ImageViewing from "react-native-image-viewing";

interface MessageImagesProps {
  images: { url: string; filename: string }[];
}

export default function MessageImages({ images }: MessageImagesProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setIsVisible(true);
  };

  // Logic render grid đơn giản hóa cho mobile
  const renderImages = () => {
    const total = images.length;
    
    // 1 ảnh
    if (total === 1) {
      return (
        <TouchableOpacity onPress={() => handleImagePress(0)} className="w-[250px] h-[180px] rounded-lg overflow-hidden">
          <Image source={{ uri: images[0].url }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    // 2 ảnh trở lên: Render dạng lưới flex wrap
    return (
      <View className="flex-row flex-wrap gap-1 w-[250px]">
        {images.slice(0, 4).map((img, index) => {
          // Tính toán width: nếu là ảnh lẻ cuối cùng trong hàng 3 ảnh -> full width (logic tùy chỉnh)
          // Ở đây mình set fix cứng grid 2x2 cho đơn giản trên mobile
          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleImagePress(index)}
              className="w-[122px] h-[122px] rounded-md overflow-hidden relative"
            >
              <Image source={{ uri: img.url }} className="w-full h-full" resizeMode="cover" />
              {/* Overlay số lượng ảnh còn lại nếu > 4 */}
              {index === 3 && total > 4 && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center">
                  <Text className="text-white text-xl font-bold">+{total - 4}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View>
      {renderImages()}
      
      {/* Modal xem ảnh full */}
      <ImageViewing
        images={images.map(img => ({ uri: img.url }))}
        imageIndex={currentImageIndex}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      />
    </View>
  );
}