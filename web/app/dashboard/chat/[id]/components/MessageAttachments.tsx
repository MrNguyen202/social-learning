import React from "react";
import { Download } from "lucide-react";
import getFileIconUrl from "@/utils/getIconTypeAttach";
import MessageImages from "./MessageImages";

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
  
  // Logic render file (Video/Document) giữ nguyên
  const renderFile = () => {
    if (!file) return null;
    // Xử lý Video
    if (file.mimeType?.startsWith("video/")) {
        return (
          <div className="rounded-lg overflow-hidden max-w-xs bg-black">
            <video controls className="w-full max-h-60 object-contain">
              <source src={file.url} type={file.mimeType} />
            </video>
          </div>
        );
      }
  
      return (
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm max-w-xs">
          <img
            src={getFileIconUrl({ name: file.filename } as unknown as File)}
            alt="file-icon"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-sm font-medium text-gray-700 truncate" title={file.filename}>
              {file.filename}
            </span>
            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <a
            href={file.url}
            download={file.filename}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto p-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
          </a>
        </div>
      );
  };

  return (
    <div className="flex flex-col">
      {/* Thay thế đoạn code render images cũ bằng component mới */}
      <MessageImages images={images || []} />
      
      {renderFile()}
    </div>
  );
}