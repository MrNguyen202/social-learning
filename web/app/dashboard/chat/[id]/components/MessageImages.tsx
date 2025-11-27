// components/chat/MessageImages.tsx
"use client";

import ImageGalleryModal from "@/components/ui/ImageGalleryModal";
import React, { useState } from "react";

interface MessageImagesProps {
    images: { url: string; filename: string }[];
}

export default function MessageImages({ images }: MessageImagesProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedImageIndex, setClickedImageIndex] = useState(0);

    if (!images || images.length === 0) return null;

    // --- Logic Grouping ảnh (Chuyển từ RenderImageMessage.jsx) ---
    const groupImages = (imgs: any[]) => {
        let group = [];
        if (imgs.length === 1) {
            group.push([imgs[0]]);
        } else if (imgs.length === 2) {
            group.push([imgs[0], imgs[1]]);
        } else if (imgs.length === 3) {
            // 2 ảnh trên, 1 ảnh dưới
            group.push([imgs[0], imgs[1]], [imgs[2]]);
        } else if (imgs.length === 4) {
            // 2 ảnh trên, 2 ảnh dưới
            group.push([imgs[0], imgs[1]], [imgs[2], imgs[3]]);
        } else if (imgs.length === 5) {
            // 3 ảnh trên, 2 ảnh dưới
            group.push([imgs[0], imgs[1], imgs[2]], [imgs[3], imgs[4]]);
        } else {
            // 6 ảnh trở lên: mỗi hàng 3 ảnh
            for (let i = 0; i < imgs.length; i += 3) {
                group.push(imgs.slice(i, i + 3));
            }
        }
        return group;
    };

    const imageGroups = groupImages(images);

    // Hàm xử lý click mở modal
    const handleImageClick = (imgUrl: string) => {
        // Tìm index thực tế trong mảng gốc images để Modal hiển thị đúng thứ tự
        const index = images.findIndex((img) => img.url === imgUrl);
        setClickedImageIndex(index !== -1 ? index : 0);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="flex flex-col gap-1 w-full max-w-[300px]"> {/* max-w để giới hạn chiều rộng giống wh */}
                {imageGroups.map((group, groupIndex) => (
                    <div
                        key={groupIndex}
                        className={`grid gap-1 w-full ${
                            // Logic chia cột Tailwind tương ứng với số lượng ảnh trong group
                            group.length === 1
                                ? "grid-cols-1"
                                : group.length === 2
                                    ? "grid-cols-2"
                                    : "grid-cols-3"
                            }`}
                    >
                        {group.map((img, imgIndex) => (
                            <div
                                key={imgIndex}
                                className="relative overflow-hidden rounded-md bg-gray-100 cursor-pointer group"
                                style={{
                                    // Giữ tỉ lệ khung hình đẹp (Vuông hoặc chữ nhật tùy số lượng)
                                    aspectRatio: group.length === 1 ? "16/9" : "1/1"
                                }}
                                onClick={() => handleImageClick(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt={`img-${groupIndex}-${imgIndex}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Modal xem ảnh full màn hình */}
            <ImageGalleryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                images={images} // Truyền mảng gốc vào để slide qua lại
                initialIndex={clickedImageIndex}
            />
        </>
    );
}