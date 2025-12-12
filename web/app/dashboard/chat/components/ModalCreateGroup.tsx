"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2, CheckCircle2, Circle, Users, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { createConversation } from "@/app/apiClient/chat/conversation/conversation";
import { getFollowing, getFollowers } from "@/app/apiClient/follow/follow";
import { useConversation } from "@/components/contexts/ConversationContext";
import { toast } from "react-toastify"; // Hoặc library toast bạn dùng
import { getUserImageSrc } from "@/app/apiClient/image/image";

interface ModalCreateGroupProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type TabType = 'following' | 'followers';

export default function ModalCreateGroup({ open, setOpen }: ModalCreateGroupProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { setSelectedConversation } = useConversation();

    // -- State --
    const [groupName, setGroupName] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>('following');
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Mảng ID user đã chọn
    const [loadingData, setLoadingData] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Load Data
    useEffect(() => {
        if (open && user?.id) {
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
            // Reset form
            setGroupName("");
            setSelectedUsers([]);
            setSearchTerm("");
            setActiveTab('following');
        }
    }, [open, user?.id]);

    // 2. Toggle Selection
    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // 3. Filter List
    const displayList = useMemo(() => {
        const sourceList = activeTab === 'following' ? followingList : followersList;
        if (!searchTerm.trim()) return sourceList;
        return sourceList.filter(u =>
            (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.nick_name && u.nick_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [activeTab, followingList, followersList, searchTerm]);

    // 4. Create Group Handler
    const handleCreateGroup = async () => {
        // Validation: Tên nhóm + Tối thiểu 2 người được chọn
        if (!groupName.trim()) {
            toast.warning("Vui lòng nhập tên nhóm", { autoClose: 3000 });
            return;
        }
        if (selectedUsers.length < 2) {
            toast.warning("Nhóm cần tối thiểu 3 thành viên (Bạn và 2 người khác).", { autoClose: 3000 });
            return;
        }
        if (!user) return;

        setCreating(true);

        try {
            // Gom user info từ ID đã chọn
            const allLoadedUsers = [...followingList, ...followersList];
            const uniqueSelectedMembers = new Map();

            selectedUsers.forEach(id => {
                const userInfo = allLoadedUsers.find(u => u.id === id);
                if (userInfo) uniqueSelectedMembers.set(id, userInfo);
            });

            // Format data gửi API
            const members = [
                { userId: user.id, role: "admin" }, // Admin
                ...Array.from(uniqueSelectedMembers.values()).map((u: any) => ({ userId: u.id, role: "member" }))
            ];

            const newGroup = await createConversation({
                name: groupName,
                type: "group",
                members: members,
                admin: user.id,
            });

            setSelectedConversation(newGroup);
            setOpen(false);
            router.push(`/dashboard/chat/${newGroup.id}`);
            toast.success("Tạo nhóm thành công!", { autoClose: 2000 });
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Lỗi khi tạo nhóm", { autoClose: 2000 });
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] h-[650px] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle>Tạo nhóm mới</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col overflow-hidden px-4">
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Tên nhóm <span className="text-red-500">*</span></label>
                        <Input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Nhập tên nhóm..."
                            className="bg-gray-50"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center border-b mb-3">
                        <button
                            onClick={() => { setActiveTab('following'); setSearchTerm(""); }}
                            className={`flex-1 pb-2 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'following' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <UserCheck className="w-4 h-4" /> Đang theo dõi ({followingList.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('followers'); setSearchTerm(""); }}
                            className={`flex-1 pb-2 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'followers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <Users className="w-4 h-4" /> Người theo dõi ({followersList.length})
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={`Tìm trong danh sách...`}
                            className="pl-8 h-9 text-sm"
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
                            <div className="text-center py-8 text-gray-500 text-sm">Không tìm thấy ai.</div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                        {/* Hiển thị số lượng đã chọn & Cảnh báo nếu chưa đủ */}
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-600">
                                Đã chọn: <strong className={selectedUsers.length < 2 ? "text-red-500" : "text-blue-600"}>
                                    {selectedUsers.length}
                                </strong>
                            </span>
                            {selectedUsers.length < 2 && (
                                <span className="text-[10px] text-red-500 italic">
                                    *Cần chọn thêm {2 - selectedUsers.length} người
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Hủy</Button>

                            {/* Disable nút nếu chưa đủ 2 người hoặc chưa nhập tên */}
                            <Button
                                size="sm"
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim() || selectedUsers.length < 2 || creating}
                                className={selectedUsers.length < 2 ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {creating && <Loader2 className="animate-spin w-3 h-3 mr-2" />}
                                Tạo nhóm
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}