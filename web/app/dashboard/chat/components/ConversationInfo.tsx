"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { X, UserPlus, LogOut, Trash2, Shield, UserX, Crown, Edit2, Camera, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
    deleteConversationHistory,
    dissolveGroupConversation,
    grantAdminInGroup,
    leaveGroupConversation,
    removeMemberFromGroup,
    updateGroupAvatar
} from "@/app/apiClient/chat/conversation/conversation";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import ModalAddMember from "./ModalAddMember";
import ModalRenameGroup from "./ModalRenameGroup";

interface ConversationInfoProps {
    conversation: any;
    currentUser: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ConversationInfo({
    conversation,
    currentUser,
    isOpen,
    onClose,
    onUpdate
}: ConversationInfoProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE UI ---
    const [isTransferMode, setIsTransferMode] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);

    // --- STATE CHO MODAL XÁC NHẬN (Thay thế window.confirm) ---
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => Promise<void>; // Hàm sẽ chạy khi bấm Đồng ý
        variant: "destructive" | "default"; // Màu nút (Đỏ hoặc Xanh)
        isLoading: boolean;
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: async () => { },
        variant: "default",
        isLoading: false,
    });

    if (!isOpen || !conversation) return null;

    const currentMember = conversation.members?.find((m: any) => m.id === currentUser?.id);
    const isAdmin = currentMember?.role === "admin";
    const isGroup = conversation.type === "group";

    // --- HÀM HELPER ĐỂ MỞ MODAL XÁC NHẬN ---
    const openConfirmModal = (
        title: string,
        description: string,
        action: () => Promise<void>,
        variant: "destructive" | "default" = "default"
    ) => {
        setConfirmModal({
            isOpen: true,
            title,
            description,
            action,
            variant,
            isLoading: false,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleConfirmAction = async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
            await confirmModal.action();
            closeConfirmModal();
        } catch (error) {
            console.error(error);
        } finally {
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
    };

    // --- CÁC HÀM LOGIC API (Đã tách khỏi confirm) ---

    // 1. Logic Rời nhóm
    const executeLeaveGroup = async () => {
        try {
            await leaveGroupConversation(conversation.id);
            toast.success("Đã rời nhóm thành công");
            router.push("/dashboard/chat");
        } catch (error: any) {
            const errorCode = error.response?.data?.error || error.error;
            if (errorCode === "ADMIN_TRANSFER_REQUIRED") {
                // Nếu server báo lỗi cần chuyển quyền -> Đóng modal xác nhận -> Bật chế độ chuyển quyền
                closeConfirmModal();
                setTimeout(() => {
                    toast.info("Bạn là Admin duy nhất. Vui lòng chọn người kế nhiệm.");
                    setIsTransferMode(true);
                }, 300); // Delay nhỏ để tránh xung đột UI
            } else {
                toast.error("Có lỗi xảy ra khi rời nhóm");
            }
        }
    };

    // 2. Logic Xóa thành viên
    const executeRemoveMember = async (memberId: string) => {
        try {
            await removeMemberFromGroup(conversation.id, memberId);
            toast.success("Đã xóa thành viên");
            onUpdate();
        } catch (error) {
            toast.error("Lỗi xóa thành viên");
        }
    };

    // 3. Logic Thăng cấp
    const executePromote = async (memberId: string) => {
        try {
            await grantAdminInGroup(conversation.id, memberId);
            toast.success("Đã thăng cấp");
            onUpdate();
        } catch (error) {
            toast.error("Lỗi thăng cấp");
        }
    };

    // 4. Logic Xóa lịch sử
    const executeDeleteHistory = async () => {
        try {
            await deleteConversationHistory(conversation.id);
            localStorage.removeItem("selectedConversation");
            toast.success("Đã xóa lịch sử");
            router.push("/dashboard/chat");
        } catch (error) {
            toast.error("Lỗi xóa lịch sử");
        }
    };

    // 5. Logic Giải tán nhóm
    const executeDissolve = async () => {
        try {
            await dissolveGroupConversation(conversation.id);
            toast.success("Nhóm đã giải tán");
            router.push("/dashboard/chat");
        } catch (error) {
            toast.error("Lỗi giải tán nhóm");
        }
    };

    // 6. Logic Chuyển quyền & Rời (Không cần modal vì nút "Chọn" đã là hành động rõ ràng, hoặc thêm nếu muốn)
    const handlePromoteAndLeave = async (newAdminId: string) => {
        // Cái này có thể confirm nhẹ hoặc làm luôn vì user đang ở mode "Chọn Admin"
        try {
            await grantAdminInGroup(conversation.id, newAdminId);
            toast.success("Đã chuyển quyền Admin.");
            await leaveGroupConversation(conversation.id);
            toast.success("Đã rời nhóm.");
            router.push("/dashboard/chat");
        } catch (error) {
            toast.error("Lỗi khi chuyển quyền. Vui lòng thử lại.");
            setIsTransferMode(false);
        }
    };

    // 7. Logic Upload Avatar
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá lớn. Vui lòng chọn ảnh dưới 5MB");
            return;
        }
        try {
            const toastId = toast.loading("Đang tải ảnh lên...");
            await updateGroupAvatar(conversation.id, file);
            toast.update(toastId, { render: "Cập nhật ảnh thành công", type: "success", isLoading: false, autoClose: 3000 });
            if (fileInputRef.current) fileInputRef.current.value = "";
            onUpdate();
        } catch (error) {
            toast.dismiss();
            toast.error("Lỗi khi cập nhật ảnh nhóm");
        }
    };


    return (
        <div className="w-80 h-full border-l border-gray-200 bg-white flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
            {/* --- HEADER --- */}
            <div className={`h-[73px] border-b border-gray-200 flex items-center justify-between px-4 transition-colors ${isTransferMode ? 'bg-orange-50' : 'bg-white'}`}>
                <h3 className={`font-semibold text-lg ${isTransferMode ? 'text-orange-700' : ''}`}>
                    {isTransferMode ? "Chọn Admin mới" : "Thông tin hội thoại"}
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* --- BANNER CẢNH BÁO --- */}
            {isTransferMode && (
                <div className="bg-orange-100 p-3 px-4 text-xs text-orange-800 border-b border-orange-200 flex gap-2 items-center">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Bạn cần chọn một thành viên để làm <strong>Trưởng nhóm</strong> trước khi rời đi.</span>
                </div>
            )}

            {/* --- BODY --- */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* Avatar & Name */}
                {!isTransferMode && (
                    conversation.type === "private" ? (
                        <div className="flex flex-col items-center mb-6">
                            <Avatar className="w-20 h-20 mb-3 border">
                                <AvatarImage src={getUserImageSrc(conversation.members?.find((m: any) => m.id !== currentUser?.id)?.avatarUrl) || undefined} />
                                <AvatarFallback>{conversation.members?.find((m: any) => m.id !== currentUser?.id)?.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <h2 className="font-bold text-lg text-center">
                                {conversation.members?.find((m: any) => m.id !== currentUser?.id)?.name}
                            </h2>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer">
                                <Avatar className="w-24 h-24 mb-3 border-4 border-white shadow-sm">
                                    <AvatarImage src={conversation?.avatar} />
                                    <AvatarFallback>{conversation?.name?.[0] || "G"}</AvatarFallback>
                                </Avatar>

                                {isGroup && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Camera className="text-white w-8 h-8" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <div className="flex items-center gap-2 justify-center w-full">
                                <h2 className="font-bold text-lg text-center truncate max-w-[200px]">
                                    {conversation.name}
                                </h2>
                                {isGroup && (
                                    <button
                                        onClick={() => setShowRenameModal(true)}
                                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                )}

                {/* Danh sách thành viên */}
                {isGroup && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-600 text-sm">Thành viên ({conversation.members?.length})</h4>
                            {!isTransferMode && (
                                <button onClick={() => setShowAddMember(true)} className="text-blue-600 text-sm hover:underline flex items-center gap-1 hover:cursor-pointer">
                                    <UserPlus size={14} /> Thêm
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {conversation.members?.map((member: any) => (
                                <div key={member.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                            <AvatarImage src={getUserImageSrc(member?.avatarUrl)} />
                                            <AvatarFallback>{member.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {member.name} {member.id === currentUser?.id && "(Bạn)"}
                                            </p>
                                            {member.role === 'admin' && <span className="text-xs text-blue-500 flex items-center"><Crown size={10} className="mr-1" /> Admin</span>}
                                        </div>
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    {isTransferMode ? (
                                        member.id !== currentUser.id && (
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                                                onClick={() => handlePromoteAndLeave(member.id)}
                                            >
                                                Chọn
                                            </Button>
                                        )
                                    ) : (
                                        isAdmin && member.id !== currentUser.id && (
                                            <div className="hidden group-hover:flex gap-1">
                                                {/* NÚT THĂNG CẤP */}
                                                <button
                                                    onClick={() => openConfirmModal(
                                                        "Chuyển quyền Admin",
                                                        `Bạn có chắc chắn chuyển quyền Admin cho ${member.name}?`,
                                                        () => executePromote(member.id)
                                                    )}
                                                    className="p-1.5 hover:bg-blue-50 rounded text-blue-500 transition-colors"
                                                    title="Chuyển quyền Admin"
                                                >
                                                    <Shield size={14} />
                                                </button>

                                                {/* NÚT XÓA THÀNH VIÊN */}
                                                <button
                                                    onClick={() => openConfirmModal(
                                                        "Mời ra khỏi nhóm",
                                                        `Bạn có chắc chắn muốn mời ${member.name} ra khỏi nhóm?`,
                                                        () => executeRemoveMember(member.id),
                                                        "destructive"
                                                    )}
                                                    className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors"
                                                    title="Mời ra khỏi nhóm"
                                                >
                                                    <UserX size={14} />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- FOOTER ACTIONS --- */}
                <div className="border-t pt-4 space-y-2">
                    {isTransferMode ? (
                        <Button
                            variant="outline"
                            className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                            onClick={() => setIsTransferMode(false)}
                        >
                            Hủy bỏ rời nhóm
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-700 hover:bg-gray-100"
                                onClick={() => openConfirmModal(
                                    "Xóa lịch sử",
                                    "Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện phía bạn? Hành động này không thể hoàn tác.",
                                    executeDeleteHistory,
                                    "destructive"
                                )}
                            >
                                <Trash2 size={16} className="mr-2" /> Xóa lịch sử trò chuyện
                            </Button>

                            {isGroup && (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openConfirmModal(
                                        "Rời nhóm",
                                        "Bạn có chắc chắn muốn rời khỏi nhóm này?",
                                        executeLeaveGroup,
                                        "destructive"
                                    )}
                                >
                                    <LogOut size={16} className="mr-2" /> Rời nhóm
                                </Button>
                            )}

                            {isGroup && isAdmin && (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-600 font-bold hover:bg-red-100"
                                    onClick={() => openConfirmModal(
                                        "Giải tán nhóm",
                                        "Hành động này sẽ xóa nhóm vĩnh viễn đối với tất cả thành viên. Bạn có chắc chắn không?",
                                        executeDissolve,
                                        "destructive"
                                    )}
                                >
                                    <X size={16} className="mr-2" /> Giải tán nhóm
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            {isGroup && (
                <>
                    <ModalAddMember
                        isOpen={showAddMember}
                        onClose={() => setShowAddMember(false)}
                        conversationId={conversation.id}
                        currentMembers={conversation.members}
                    />
                    <ModalRenameGroup
                        isOpen={showRenameModal}
                        onClose={() => setShowRenameModal(false)}
                        conversationId={conversation.id}
                        currentName={conversation.name}
                    />
                </>
            )}

            {/* --- MODAL XÁC NHẬN CHUNG (PREMIUM UI) --- */}
            <Dialog open={confirmModal.isOpen} onOpenChange={closeConfirmModal}>
                <DialogContent className="sm:max-w-[450px] p-6 sm:rounded-2xl gap-5 shadow-2xl border-none bg-white">

                    <DialogHeader className="flex flex-col items-start gap-3">
                        {/* ICON WRAPPER: Tạo điểm nhấn icon với nền màu */}
                        <div className={`
                p-3 rounded-full flex items-center justify-center w-12 h-12 transition-colors
                ${confirmModal.variant === "destructive"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"}
            `}>
                            {confirmModal.variant === "destructive" ? (
                                <AlertTriangle className="w-6 h-6" />
                            ) : (
                                <Shield className="w-6 h-6" />
                            )}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {confirmModal.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                                {confirmModal.description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* FOOTER BUTTONS */}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 w-full mt-2">
                        <Button
                            variant="outline"
                            onClick={closeConfirmModal}
                            disabled={confirmModal.isLoading}
                            className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg h-10"
                        >
                            Hủy bỏ
                        </Button>

                        <Button
                            variant={confirmModal.variant}
                            onClick={handleConfirmAction}
                            disabled={confirmModal.isLoading}
                            className={`
                    w-full sm:w-auto rounded-lg h-10 font-semibold shadow-sm transition-all
                    ${confirmModal.variant === "destructive"
                                    ? "bg-red-600 hover:bg-red-700 hover:shadow-red-100 shadow-red-50"
                                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-100 shadow-blue-50"}
                `}
                        >
                            {confirmModal.isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đồng ý"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}