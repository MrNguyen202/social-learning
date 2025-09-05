"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  X,
  Upload,
  ArrowLeft,
  ArrowRight,
  MapPin,
  FileText,
  Video,
  File,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getUserImageSrc } from "@/app/api/image/route";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const proceedToNextStep = () => {
    setStep(2);
  };

  const handleShare = () => {
    onClose();
    resetModal();
  };

  const resetModal = () => {
    setStep(1);
    setSelectedFiles([]);
    setCaption("");
    setLocation("");
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  const isVideoFile = (file: File) => {
    return file.type.startsWith("video/");
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith("video/"))
      return <Video className="h-8 w-8 text-purple-500" />;
    if (file.type.includes("pdf"))
      return <FileText className="h-8 w-8 text-red-500" />;
    if (file.type.includes("word") || file.type.includes("document"))
      return <FileText className="h-8 w-8 text-blue-600" />;
    if (file.type.includes("excel") || file.type.includes("spreadsheet"))
      return <File className="h-8 w-8 text-green-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="xl:max-w-6xl xl:h-[80vh] lg:max-w-5xl lg:h-[70vh] md:max-w-4xl md:h-[70vh] sm:max-w-2xl sm:h-[70vh] max-w-xl h-[70vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            {step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="p-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-lg font-semibold">
              {step === 1 ? "Tạo bài viết mới" : "Tạo bài viết mới"}
            </DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            {step === 2 && (
              <Button
                onClick={handleShare}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 mr-[30px] cursor-pointer"
              >
                Chia sẻ
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex h-[600px]">
          {step === 1 ? (
            // Step 1: File Selection
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium">Chọn file để đăng</h3>
                <p className="text-gray-500">
                  Ảnh, video, tài liệu Word, PDF, Excel hoặc chỉ viết văn bản
                </p>

                <div className="space-y-3 mt-6">
                  <label className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium text-center p-8 rounded-xl cursor-pointer">
                    Tải ảnh lên
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <div className="text-sm text-gray-500 mt-8 mb-4">hoặc</div>
                  <Button
                    variant="outline"
                    onClick={proceedToNextStep}
                    className="border-gray-300 bg-transparent rounded-xl cursor-pointer"
                  >
                    Tạo bài viết chỉ có văn bản
                  </Button>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">File đã chọn:</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                        >
                          {getFileIcon(file)}
                          <span className="text-sm truncate flex-1">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={proceedToNextStep}
                      className="bg-blue-500 hover:bg-blue-600 text-white w-full rounded-xl cursor-pointer"
                    >
                      Tiếp theo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Step 2: Edit & Caption
            <>
              {/* File Preview */}
              <div className="flex-1 flex justify-center items-center">
                {selectedFiles.length > 0 ? (
                  selectedFiles.some((file) => isImageFile(file)) ? (
                    <img
                      src={URL.createObjectURL(
                        selectedFiles.find((file) => isImageFile(file))!
                      )}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : selectedFiles.some((file) => isVideoFile(file)) ? (
                    <video
                      src={URL.createObjectURL(
                        selectedFiles.find((file) => isVideoFile(file))!
                      )}
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center space-y-2 flex items-center">
                      {getFileIcon(selectedFiles[0])}
                      <div>
                        <p className="text-sm font-medium">
                          {selectedFiles[0].name}
                        </p>
                        <p className="text-sm text-gray-700">
                          {(selectedFiles[0].size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center text-white space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-lg">Bài viết văn bản</p>
                  </div>
                )}
              </div>

              {/* Caption & Details */}
              <div className="w-100 border-l flex flex-col">
                {/* User Info */}
                <div className="p-4 border-b flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserImageSrc(user?.avatar)} />
                  </Avatar>
                  <span className="font-semibold">{user?.nick_name}</span>
                </div>

                {/* Caption */}
                <div className="flex-1 p-4">
                  <Textarea
                    placeholder="Viết chú thích..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="border-none resize-none focus:ring-0 p-0 text-sm"
                    rows={8}
                  />
                </div>

                {/* Additional Options */}
                <div className="p-4 space-y-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Thêm vị trí</span>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>

                  <Input
                    placeholder="Thêm vị trí"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-sm"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Khả năng tiếp cận
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 p-0"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Cài đặt nâng cao
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
