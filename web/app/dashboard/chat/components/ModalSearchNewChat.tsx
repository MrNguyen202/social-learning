"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2, Users, UserCheck, Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { createConversation, findConversationBetweenUsers } from "@/app/apiClient/chat/conversation/conversation";
import { useConversation } from "@/components/contexts/ConversationContext";
import { getFollowing, getFollowers } from "@/app/apiClient/follow/follow";
import { toast } from "react-toastify";
import { sendMessage } from "@/app/apiClient/chat/message/message";
import { getUserImageSrc } from "@/app/apiClient/image/image";

interface ModalSearchNewChatProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type TabType = 'following' | 'followers';
type StepType = 'search' | 'compose';

// Danh sách tin nhắn gợi ý
const SUGGESTIONS = [
  "Xin chào! 👋",
  "Chào bạn, mình muốn kết nối! 🤝",
  "Hi! Long time no see.",
  "Hế lô! 😺"
];

export default function ModalSearchNewChat({ open, setOpen }: ModalSearchNewChatProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setSelectedConversation } = useConversation();

  // -- Data State --
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followersList, setFollowersList] = useState<any[]>([]);

  // -- UI State --
  const [step, setStep] = useState<StepType>('search'); // Mặc định là tìm kiếm
  const [selectedPartner, setSelectedPartner] = useState<any>(null); // Lưu người được chọn để chat
  const [firstMessage, setFirstMessage] = useState(""); // Nội dung tin nhắn đầu tiên
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [processing, setProcessing] = useState(false);

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
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();

      // Reset toàn bộ state khi mở lại modal
      setSearchTerm("");
      setActiveTab('following');
      setStep('search');
      setSelectedPartner(null);
      setFirstMessage("");
      setProcessing(false);
    }
  }, [open, user?.id]);

  // 2. Filter Logic
  const displayList = useMemo(() => {
    const sourceList = activeTab === 'following' ? followingList : followersList;
    if (!searchTerm.trim()) return sourceList;
    const lowerTerm = searchTerm.toLowerCase();
    return sourceList.filter(u =>
      (u.name && u.name.toLowerCase().includes(lowerTerm)) ||
      (u.nick_name && u.nick_name.toLowerCase().includes(lowerTerm))
    );
  }, [activeTab, followingList, followersList, searchTerm]);

  // 3. Handle Click User -> Check Old Chat -> If No, Go to Step 2
  const handleUserClick = async (targetUser: any) => {
    if (!user || processing) return;
    setProcessing(true);

    try {
      // Kiểm tra chat cũ
      const checkRes = await findConversationBetweenUsers(targetUser.id);

      if (checkRes.message === "Yes" && checkRes.conversation) {
        // Nếu ĐÃ CÓ -> Vào luôn, không cần nhập tin nhắn đầu
        setOpen(false);
        setSelectedConversation(checkRes.conversation);
        router.push(`/dashboard/chat/${checkRes.conversation.id}`);
      } else {
        // Nếu CHƯA CÓ -> Chuyển sang bước nhập tin nhắn
        setSelectedPartner(targetUser);
        setStep('compose'); // <--- Chuyển view
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  // 4. Handle Create & Send (Logic chính)
  const handleSendFirstMessage = async () => {
    if (!firstMessage.trim() || !selectedPartner || !user) return;
    setProcessing(true);

    try {
      // B1: Tạo hội thoại
      const newConv = await createConversation({
        type: "private",
        members: [
          { userId: user.id, role: "member" },
          { userId: selectedPartner.id, role: "member" }
        ]
      });

      // B2: Gửi tin nhắn đầu tiên
      await sendMessage({
        conversationId: newConv.id,
        senderId: user.id,
        text: firstMessage,
        files: [], // Hiện tại chưa support gửi file ở modal này
        replyTo: null
      });

      // B3: Hoàn tất & Chuyển trang
      setOpen(false);
      setSelectedConversation(newConv);
      router.push(`/dashboard/chat/${newConv.id}`);
      toast.success("Đã bắt đầu cuộc trò chuyện!", { autoClose: 2000 });

    } catch (error) {
      console.error("Failed to start chat:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.", { autoClose: 2000 });
    } finally {
      setProcessing(false);
    }
  };

  // Helper: Chọn tin nhắn gợi ý
  const pickSuggestion = (text: string) => {
    setFirstMessage(text);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[450px] h-[550px] flex flex-col p-0 gap-0 overflow-hidden transition-all duration-300">

        {/* --- HEADER --- */}
        <DialogHeader className="p-4 pb-2 border-b flex flex-row items-center gap-2 space-y-0">
          {step === 'compose' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2"
              onClick={() => setStep('search')} // Back button
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <DialogTitle>
            {step === 'search' ? "Tin nhắn mới" : `Gửi tin nhắn tới ${selectedPartner?.name}`}
          </DialogTitle>
        </DialogHeader>

        {/* --- BODY --- */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* VIEW 1: DANH SÁCH USER (SEARCH) */}
          {step === 'search' && (
            <>
              {/* Tabs */}
              <div className="flex items-center border-b bg-gray-50/50">
                <button
                  onClick={() => { setActiveTab('following'); setSearchTerm(""); }}
                  className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 border-b-2 ${activeTab === 'following' ? 'text-blue-600 border-blue-600 bg-white' : 'text-gray-500 border-transparent'
                    }`}
                >
                  <UserCheck className="w-4 h-4" /> Đang theo dõi ({followingList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('followers'); setSearchTerm(""); }}
                  className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 border-b-2 ${activeTab === 'followers' ? 'text-blue-600 border-blue-600 bg-white' : 'text-gray-500 border-transparent'
                    }`}
                >
                  <Users className="w-4 h-4" /> Người theo dõi ({followersList.length})
                </button>
              </div>

              {/* Search */}
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm người dùng..."
                    className="pl-9 h-9 bg-gray-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                {loadingData ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                ) : displayList.length > 0 ? (
                  displayList.map(u => (
                    <div key={u.id} onClick={() => handleUserClick(u)} className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition group">
                      <Avatar>
                        <AvatarImage src={getUserImageSrc(u.avatar)} />
                        <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm group-hover:text-blue-600">{u.name}</p>
                        <p className="text-xs text-gray-500">@{u.nick_name}</p>
                      </div>
                    </div>
                  ))
                ) : <p className="text-center text-gray-500 p-4 text-sm">Không tìm thấy kết quả.</p>}
              </div>
            </>
          )}

          {/* VIEW 2: NHẬP TIN NHẮN ĐẦU TIÊN (COMPOSE) */}
          {step === 'compose' && selectedPartner && (
            <div className="flex flex-col h-full p-4 animate-in slide-in-from-right-10 duration-300">

              {/* User Info Summary */}
              <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl border">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={getUserImageSrc(selectedPartner.avatar)} />
                  <AvatarFallback>{selectedPartner.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{selectedPartner.name}</p>
                  <p className="text-xs text-gray-500">Bắt đầu cuộc trò chuyện mới</p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase">Gợi ý lời chào:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => pickSuggestion(sug)}
                      className="text-xs border px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition bg-white"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tin nhắn:</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Nhập lời chào của bạn..."
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Footer Actions */}
              <div className="mt-auto pt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button
                  onClick={handleSendFirstMessage}
                  disabled={!firstMessage.trim() || processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Gửi & Bắt đầu
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}