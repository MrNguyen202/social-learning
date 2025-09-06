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
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getUserImageSrc } from "@/app/api/image/route";
import {
  createOrUpdatePost,
  convertFileToBase64,
  CreatePostData,
} from "@/app/api/post/route";
import { toast } from "react-toastify";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Chỉ lưu một file
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Chỉ lấy file đầu tiên

    if (!file) return;

    // Validate file size (max 30MB)
    const maxFileSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxFileSize) {
      toast.error(
        `File "${file.name}" quá lớn. Vui lòng chọn file nhỏ hơn 30MB.`
      );
      return;
    }

    setSelectedFile(file);
  };

  const proceedToNextStep = () => {
    setStep(2);
  };

  const handleShare = async () => {
    if (!content.trim() && !selectedFile) {
      toast.error("Vui lòng nhập nội dung hoặc chọn file");
      return;
    }

    setIsLoading(true);

    try {
      let fileData = null;
      if (selectedFile) {
        fileData = await convertFileToBase64(selectedFile);
      }

      const postData: CreatePostData = {
        content: content.trim(),
        userId: user?.id,
        file: fileData,
      };

      const result = await createOrUpdatePost(postData);

      if (result.success) {
        toast.success("Đã tạo bài viết thành công!", { autoClose: 1500 });
        onPostCreated?.();
        handleClose();
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi tạo bài viết");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Có lỗi xảy ra khi tạo bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedFile(null);
    setContent("");
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetModal();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
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
    if (
      file.type.includes("excel") ||
      file.type.includes("spreadsheet") ||
      file.type.includes("sheet")
    )
      return <FileText className="h-8 w-8 text-green-600" />;
    if (file.type.includes("word") || file.type.includes("document"))
      return <FileText className="h-8 w-8 text-blue-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="xl:max-w-6xl xl:h-[80vh] lg:max-w-5xl lg:h-[70vh] md:max-w-4xl md:h-[70vh] sm:max-w-2xl sm:h-[70vh] max-w-xl h-[70vh] p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            {step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="p-1 cursor-pointer"
                disabled={isLoading}
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
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 mr-[30px] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Đang đăng..." : "Chia sẻ"}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex h-[600px]">
          {step === 1 ? (
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
                  <label className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium text-center p-8 rounded-xl cursor-pointer block">
                    Tải file lên
                    <Input
                      id="file-upload"
                      type="file"
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

                {selectedFile && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">File đã chọn:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        {getFileIcon(selectedFile)}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm truncate block">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
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
            <>
              <div className="flex-1 flex justify-center items-center bg-gray-50">
                {selectedFile ? (
                  isImageFile(selectedFile) ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : isVideoFile(selectedFile) ? (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="flex flex-col items-center space-y-2">
                        {getFileIcon(selectedFile)}
                        <div>
                          <p className="text-sm font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-lg text-gray-600">Bài viết văn bản</p>
                  </div>
                )}
              </div>

              <div className="w-96 border-l flex flex-col">
                <div className="p-4 border-b flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserImageSrc(user?.avatar)} />
                  </Avatar>
                  <span className="font-semibold">{user?.nick_name}</span>
                </div>

                <div className="flex-1 p-4">
                  <Textarea
                    placeholder="Viết nội dung..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border-none resize-none focus:ring-0 p-0 text-sm"
                    rows={8}
                    disabled={isLoading}
                  />

                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">
                        1 file đính kèm:
                      </p>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <div className="w-4 h-4 flex-shrink-0 mr-6">
                          {getFileIcon(selectedFile)}
                        </div>
                        <span className="truncate">{selectedFile.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
