"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Upload, ArrowLeft, FileText, Video, File } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getSupabaseFileUrl, getUserImageSrc } from "@/app/apiClient/image/image";
import {
  convertFileToBase64,
  type CreatePostData,
  updatePost,
  createPost,
} from "@/app/apiClient/post/post";
import { toast } from "react-toastify";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  isEdit?: boolean;
}

export function CreateOrUpdatePostModal({
  isOpen,
  onClose,
  post,
  isEdit,
}: CreatePostModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Chỉ lưu một file
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [original_name, setOriginal_name] = useState<string>();
  const [content, setContent] = useState("");
  const [postId, setPostId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Chỉ lấy file đầu tiên

    if (!file) return;

    // Validate file size (max 30MB)
    const maxFileSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxFileSize) {
      toast.error(`${t("dashboard.fileTooLarge")}`, {
        autoClose: 1000,
      });
      return;
    }

    setSelectedFile(file);
  };

  const proceedToNextStep = () => {
    setStep(2);
  };

  useEffect(() => {
    if (isOpen && isEdit && post) {
      setPostId(post.id || null);
      setContent(post.content || "");
      setSelectedFile(null); // reset file mới
      setExistingFileUrl(post.file || null); // giữ file cũ (từ DB)
      setOriginal_name(post?.original_name);
      setStep(2);
    }
  }, [isOpen, isEdit, post]);

  const handleShare = async () => {
    if (!content.trim() && !selectedFile) {
      toast.error(`${t("dashboard.pleaseEnterContentOrFile")}`, {
        autoClose: 1000,
      });
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

      const result = await createPost(postData);

      if (result.success) {
        toast.success(`${t("dashboard.postCreatedSuccess")}`, {
          autoClose: 1000,
        });
        handleClose();
      } else {
        toast.error(`${t("dashboard.postCreationFailed")}`, {
          autoClose: 1000,
        });
      }
    } catch (error: any) {
      toast.error(`${t("dashboard.postCreationFailed")}`, { autoClose: 1000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!content.trim() && !selectedFile) {
      toast.error(`${t("dashboard.pleaseEnterContentOrFile")}`, {
        autoClose: 1000,
      });
      return;
    }

    setIsLoading(true);

    try {
      let fileData = null;
      let originalName = null;

      // Nếu user upload file mới
      if (selectedFile) {
        fileData = await convertFileToBase64(selectedFile);
      } else if (existingFileUrl) {
        // Giữ nguyên file cũ
        fileData = existingFileUrl;
        originalName = original_name;
      }

      if (!postId) return;
      const postData: CreatePostData = {
        id: postId,
        content: content.trim(),
        userId: user?.id,
        file: { fileData, originalName },
      };

      const res = await updatePost(postData);

      if (res.success) {
        toast.success(`${t("dashboard.postUpdateSuccess")}`, {
          autoClose: 1000,
        });
        handleClose();
      } else {
        toast.error(`${t("dashboard.postUpdateFailed")}`, {
          autoClose: 1000,
        });
      }
    } catch (error: any) {
      toast.error(`${t("dashboard.postUpdateFailed")}`, {
        autoClose: 1000,
      });
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
      <DialogContent className="xl:max-w-6xl xl:h-[80vh] lg:max-w-5xl lg:h-[70vh] md:max-w-3xl md:h-[70vh] sm:max-w-xl sm:h-[70vh] max-w-sm h-[80vh] p-0 overflow-hidden">
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
              {step === 1 && !isEdit
                ? t("dashboard.createNewPost")
                : t("dashboard.editPost")}
            </DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            {step === 2 && (
              <>
                {isEdit ? (
                  <Button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white hover:text-white rounded-full px-6 mr-[30px] text-[14px] cursor-pointer"
                  >
                    {isLoading
                      ? t("dashboard.updating")
                      : t("dashboard.update")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleShare}
                    disabled={isLoading}
                    className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white hover:text-white rounded-full px-6 mr-[30px] text-[14px] cursor-pointer"
                  >
                    {isLoading ? t("dashboard.posting") : t("dashboard.share")}
                  </Button>
                )}
              </>
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
                <h3 className="text-xl font-medium">
                  {t("dashboard.selectFileToPost")}
                </h3>
                <p className="text-gray-500">
                  {t("dashboard.fileDescription")}
                </p>

                <div className="space-y-3 mt-6">
                  <label className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium text-center p-8 rounded-xl cursor-pointer block">
                    {t("dashboard.uploadFile")}
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <div className="text-sm text-gray-500 mt-8 mb-4">
                    {t("or")}
                  </div>
                  <Button
                    variant="outline"
                    onClick={proceedToNextStep}
                    className="border-gray-300 bg-transparent rounded-xl cursor-pointer"
                  >
                    {t("dashboard.createTextOnlyPost")}
                  </Button>
                </div>

                {selectedFile && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">{t("dashboard.selectedFile")}</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        {getFileIcon(selectedFile)}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm truncate block max-sm:hidden">
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
                      {t("dashboard.next")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex justify-center items-center bg-gray-50 max-sm:hidden">
                {selectedFile ? (
                  // Preview file mới
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
                ) : existingFileUrl ? (
                  existingFileUrl.endsWith(".mp4") ? (
                    <video
                      src={`${getSupabaseFileUrl(existingFileUrl)}`}
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : existingFileUrl.endsWith(".jpg") ||
                    existingFileUrl.endsWith(".png") ? (
                    <img
                      src={`${getSupabaseFileUrl(existingFileUrl)}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                      <span className="text-2xl">📄</span>
                      <a
                        href={`${getSupabaseFileUrl(existingFileUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {post?.original_name}
                      </a>
                    </div>
                  )
                ) : (
                  <div className="text-center space-y-4 max-sm:hidden">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-lg text-gray-600">
                      {t("dashboard.textPost")}
                    </p>
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
                    placeholder={t("dashboard.writeContent")}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border-none resize-none focus:ring-0 p-0 text-sm"
                    rows={8}
                    disabled={isLoading}
                  />

                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">
                        1 {t("dashboard.attachedFile")}
                      </p>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <div className="w-4 h-4 shrink-0 mr-6">
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
