"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; filename: string }[];
  initialIndex?: number;
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Lắng nghe phím ESC để đóng và phím mũi tên để chuyển ảnh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]); // eslint-disable-line

  if (!isOpen) return null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div 
        className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center backdrop-blur-sm"
        onClick={onClose} // Click ra ngoài để đóng
    >
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50"
      >
        <X size={24} />
      </button>

      {/* Nút Prev (Chỉ hiện nếu có > 1 ảnh) */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Ảnh hiển thị chính */}
      <div 
        className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()} // Chặn click đóng khi click vào ảnh
      >
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].filename}
          className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
        />
        
        {/* Caption / Số thứ tự ảnh */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
             {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Nút Next (Chỉ hiện nếu có > 1 ảnh) */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
}