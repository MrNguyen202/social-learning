"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2, CheckCircle2, Circle, Users, UserCheck } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getFollowing, getFollowers } from "@/app/apiClient/follow/follow";
import { addMembersToGroup } from "@/app/apiClient/chat/conversation/conversation";
import { toast } from "react-toastify";
import { getUserImageSrc } from "@/app/apiClient/image/image";

interface ModalAddMemberProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    currentMembers: any[]; // Để lọc bỏ người đã có trong nhóm
}

type TabType = 'following' | 'followers';

export default function ModalAddMember({ isOpen, onClose, conversationId, currentMembers }: ModalAddMemberProps) {
    const { user } = useAuth();

    // -- State --
    const [activeTab, setActiveTab] = useState<TabType>('following');
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Mảng ID user đã chọn
    const [loadingData, setLoadingData] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Load Data (Giống ModalCreateGroup)
    useEffect(() => {
        if (isOpen && user?.id) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [resFollowing, resFollowers] = await Promise.all([
                        getFollowing(user.id),
                        getFollowers(user.id)
                    ]);
                    if (resFollowing.success) setFollowingList(resFollowing.data);
                    if (resFollowers.success) setFollowersList(resFollowers.data);
                } catch (e) { console.error(e) }
                finally { setLoadingData(false); }
            };
            fetchData();

            // Reset state
            setSelectedUsers([]);
            setSearchTerm("");
            setActiveTab('following');
        }
    }, [isOpen, user?.id]);

    // 2. Toggle Selection
    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // 3. Filter List (Lọc theo Search + Lọc người ĐÃ TRONG NHÓM)
    const displayList = useMemo(() => {
        let sourceList = activeTab === 'following' ? followingList : followersList;

        // [QUAN TRỌNG] Lọc bỏ những người đã là thành viên
        sourceList = sourceList.filter(u => !currentMembers.some(member => member.id === u.id));

        // Lọc theo từ khóa tìm kiếm
        if (!searchTerm.trim()) return sourceList;
        return sourceList.filter(u =>
            (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.nick_name && u.nick_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [activeTab, followingList, followersList, searchTerm, currentMembers]);

    // 4. Submit Handler
    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;

        setAdding(true);
        try {
            // Gọi API thêm thành viên
            await addMembersToGroup(conversationId, selectedUsers);
            toast.success(`Đã thêm ${selectedUsers.length} thành viên vào nhóm`, { autoClose: 2000 });
            onClose();
        } catch (error) {
            console.error("Error adding members:", error);
            toast.error("Lỗi khi thêm thành viên", { autoClose: 2000 });
        } finally {
            setAdding(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 pb-2 border-b">
                    <DialogTitle>Thêm thành viên</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4">
                    {/* Tabs */}
                    <div className="flex items-center border-b mb-3">
                        <button
                            onClick={() => { setActiveTab('following'); setSearchTerm(""); }}
                            className={`flex-1 pb-2 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'following' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <UserCheck className="w-4 h-4" /> Đang theo dõi
                        </button>
                        <button
                            onClick={() => { setActiveTab('followers'); setSearchTerm(""); }}
                            className={`flex-1 pb-2 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'followers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <Users className="w-4 h-4" /> Người theo dõi
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={`Tìm kiếm tên...`}
                            className="pl-8 h-9 text-sm bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2 space-y-1">
                        {loadingData ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : displayList.length > 0 ? (
                            displayList.map(u => {
                                const isSelected = selectedUsers.includes(u.id);
                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => toggleSelectUser(u.id)}
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-9 h-9">
                                                <AvatarImage src={getUserImageSrc(u.avatar)} />
                                                <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{u.name}</span>
                                                <span className="text-xs text-gray-500">@{u.nick_name}</span>
                                            </div>
                                        </div>
                                        {isSelected ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <Circle className="w-5 h-5 text-gray-300" />}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm flex flex-col items-center">
                                <Users className="w-8 h-8 mb-2 opacity-20" />
                                <span>Không tìm thấy người dùng phù hợp.</span>
                                <span className="text-xs text-gray-400">(Có thể họ đã ở trong nhóm rồi)</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                        {/* Selected Count */}
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-600">
                                Đã chọn: <strong className="text-blue-600">{selectedUsers.length}</strong>
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
                            <Button
                                size="sm"
                                onClick={handleAddMembers}
                                disabled={selectedUsers.length === 0 || adding}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {adding && <Loader2 className="animate-spin w-3 h-3 mr-2" />}
                                Thêm thành viên
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}