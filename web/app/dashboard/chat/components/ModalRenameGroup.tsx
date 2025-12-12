"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { renameGroup } from "@/app/apiClient/chat/conversation/conversation";

interface ModalRenameGroupProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    currentName: string;
}

export default function ModalRenameGroup({ isOpen, onClose, conversationId, currentName }: ModalRenameGroupProps) {
    const [name, setName] = useState(currentName);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.warning("Tên nhóm không được để trống", { autoClose: 3000 });
            return;
        }

        setIsLoading(true);
        try {
            await renameGroup(conversationId, name);
            toast.success("Đổi tên nhóm thành công", { autoClose: 2000 });
            onClose();
        } catch (error) {
            toast.error("Lỗi khi đổi tên nhóm", { autoClose: 2000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Đổi tên nhóm</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên nhóm mới..."
                        autoFocus
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}