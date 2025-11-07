"use client";
import useAuth from "@/hooks/useAuth";
import { Info, Paperclip, Phone, Smile, Video } from "lucide-react";
import { useEffect, useState } from "react";
import MessageSender from "./components/MessageSender";
import MessageReceiver from "./components/MessageReceiver";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarGroup from "../components/AvatarGroup";
import {
  fetchMessages,
  markMessagesAsRead,
  sendMessage,
} from "@/app/apiClient/chat/message/message";
import { getSocket } from "@/socket/socketClient";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { checkUserOnline } from "@/app/apiClient/user/user";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function ChatDetail() {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const { selectedConversation } = useConversation();
  const [onlineStatus, setOnlineStatus] = useState<boolean>(false);
  const [offlineTime, setOfflineTime] = useState<string | null>(null);
  const router = useRouter();

  // Lắng nghe sự kiện tin nhắn mới từ socket
  useEffect(() => {
    const socket = getSocket();
    // join room
    const conversationId = selectedConversation?.id;
    if (conversationId) {
      socket.emit("joinRoom", conversationId);
    }

    // Nhận tin nhắn mới
    socket.on("newMessage", (newMessage: any) => {
      setMessages((prev) => [newMessage, ...prev]);

      // Nếu tin nhắn không phải do chính user gửi, thì đánh dấu đã xem
      if (newMessage.senderId !== user?.id && selectedConversation && user) {
        markMessagesAsRead(selectedConversation.id, user.id);
      }
    });

    // Nhận sự kiện tin nhắn đã xem
    socket.on(
      "markMessagesAsRead",
      ({
        userId,
        seenAt,
        messageIds,
      }: {
        userId: string;
        seenAt: string;
        messageIds: string[];
      }) => {
        // Cập nhật trạng thái đã xem cho các tin nhắn tương ứng
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (messageIds.includes(msg._id)) {
              // Kiểm tra nếu userId đã có trong seens thì không thêm nữa
              if (
                !msg.seens.some(
                  (seen: { userId: string }) => seen.userId === userId
                )
              ) {
                msg.seens.push({ userId, seenAt });
              }
            }
            return msg;
          })
        );
      }
    );

    return () => {
      socket.off("newMessage");
      socket.off("markMessagesAsRead");
      if (conversationId) {
        socket.emit("leaveRoom", conversationId);
      }
    };
  }, [user?.id, selectedConversation?.id]);

  // Hàm lấy tin nhắn từ server
  useEffect(() => {
    const fetchDataMessages = async () => {
      const conversationId = selectedConversation?.id;
      if (!conversationId) return;
      // Gọi API lấy tin nhắn
      const data = await fetchMessages(conversationId);
      setMessages(data);

      // Đánh dấu tất cả tin nhắn là đã xem
      if (user) {
        await markMessagesAsRead(conversationId, user.id);
      }
    };
    fetchDataMessages();
  }, [selectedConversation?.id]);

  // Hàm xử lý logic gửi tin nhắn dạng text
  const handleSendMessage = async () => {
    if (text.trim() === "" && files.length === 0) return;
    if (!user) return;
    await sendMessage({
      conversationId: selectedConversation?.id || "",
      senderId: user.id,
      text,
      files,
    });
    setText("");
  };

  // kiểm tra online status
  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (!selectedConversation?.members || !user) return;

      const otherMembers = selectedConversation.members.filter(
        (m: any) => m.id !== user?.id
      ); // Nếu là chat 1-v-1

      if (selectedConversation.type === "private") {
        if (otherMembers.length > 0) {
          const otherMember = otherMembers[0];
          try {
            const res = await checkUserOnline(otherMember.id);
            setOnlineStatus(res.data.isOnline); // Chỉ set offlineTime khi user thực sự offline
            setOfflineTime(res.data.isOnline ? null : res.data.offlineTime);
          } catch (error) {
            console.error("Failed to check user online status:", error);
            setOnlineStatus(false);
            setOfflineTime(null);
          }
        }
      } // Nếu là chat nhóm
      else {
        if (otherMembers.length > 0) {
          try {
            // 1. Tạo một mảng các promise để check status của tất cả thành viên
            const statusPromises = otherMembers.map((member: any) =>
              checkUserOnline(member.id)
            ); // 2. Chờ tất cả các API call hoàn thành
            const statusResults = await Promise.all(statusPromises); // 3. Kiểm tra xem có BẤT KỲ (some) ai online không

            const isAnyoneOnline = statusResults.some(
              (res) => res.data.isOnline
            ); // 4. Set state MỘT LẦN duy nhất

            setOnlineStatus(isAnyoneOnline); // 5. Không set offlineTime cho group
            setOfflineTime(null);
          } catch (error) {
            console.error("Failed to check group online status:", error);
            setOnlineStatus(false);
            setOfflineTime(null);
          }
        }
      }
    };

    checkOnlineStatus();

    // Bạn có thể thêm một interval để check lại status mỗi 30 giây
    // const intervalId = setInterval(checkOnlineStatus, 30000);
    // return () => clearInterval(intervalId);
  }, [selectedConversation, user?.id]);

  // // Hàm xử lý bắt đầu cuộc gọi
  // const handleStartCall = () => {
  //   // 1. Kiểm tra trạng thái online
  //   if (!onlineStatus) {
  //     const message =
  //       selectedConversation?.type === "private"
  //         ? "Người dùng không online."
  //         : "Không có thành viên nào online";
  //     toast.info(message, { autoClose: 1000 });
  //     return;
  //   }

  //   // 2. Chuyển đến trang cuộc gọi
  //   router.push(`/room/${selectedConversation?.id}`);
  // };

  // // Hàm xử lý bắt đầu cuộc gọi
  const handleStartCall = () => {
    // Kiểm tra trạng thái online
    if (!onlineStatus) {
      const message =
        selectedConversation?.type === "private"
          ? "Người dùng không online."
          : "Không có thành viên nào online";
      toast.info(message, { autoClose: 1000 });
      return;
    } 
    
    // GỬI TÍN HIỆU GỌI
    const socket = getSocket();
    const callPayload = {
      conversationId: selectedConversation?.id,
      callerId: user?.id,
      callerName: user?.name,
      members: selectedConversation?.members,
    };

    socket.emit("startCall", callPayload); // chuyển đến trang cuộc gọi
    router.push(`/room/${selectedConversation?.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {selectedConversation?.type === "private" ? (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={getUserImageSrc(
                    selectedConversation?.members.filter(
                      (member: { id: string }) => member.id !== user?.id
                    )[0]?.avatarUrl
                  )}
                  alt={user?.name}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-gray-300">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </>
          ) : selectedConversation?.avatar === "" ? (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={getUserImageSrc(selectedConversation?.avatar)}
                  alt={selectedConversation?.name}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-gray-300">
                  {selectedConversation?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </>
          ) : (
            <AvatarGroup members={selectedConversation?.members || []} />
          )}
          {selectedConversation?.type === "private" ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {
                    selectedConversation?.members.filter(
                      (member: { id: string }) => member.id !== user?.id
                    )[0]?.name
                  }
                </h2>
                {onlineStatus ? (
                  <span className="w-3 h-3 bg-green-500 rounded-full mb-1"></span>
                ) : (
                  <span className="w-3 h-3 bg-red-500 rounded-full mb-1"></span>
                )}
              </div>
              <div className="text-gray-500">
                {onlineStatus ? "Đang online" : offlineTime || ""}
              </div>
            </>
          ) : selectedConversation?.name ? (
            <>
              <h2 className="text-lg font-semibold">
                {selectedConversation?.name}
              </h2>
              {onlineStatus ? (
                <span className="w-3 h-3 bg-green-500 rounded-full mb-1"></span>
              ) : (
                <span className="w-3 h-3 bg-red-500 rounded-full mb-1"></span>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">
                Bạn,{" "}
                {selectedConversation?.members
                  .filter((m: { id: string }) => m.id !== user?.id)
                  .map((m: { name: string }) => m.name)
                  .join(", ")}
              </h2>
              {onlineStatus ? (
                <span className="w-3 h-3 bg-green-500 rounded-full mb-1"></span>
              ) : (
                <span className="w-3 h-3 bg-red-500 rounded-full mb-1"></span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartCall()}
            className="p-2 hover:cursor-pointer hover:bg-gray-200 rounded-full"
          >
            <Phone className="w-6 h-6 text-gray-500 hover:text-black" />
          </button>
          <button
            onClick={() => console.log("Options clicked")}
            className="p-2 hover:cursor-pointer hover:bg-gray-200 rounded-full"
          >
            <Info className="w-6 h-6 text-gray-500 hover:text-black" />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 gap-4 flex flex-col-reverse">
        {/* Nội dung tin nhắn */}
        {messages.map((message) =>
          message?.senderId === user?.id ? (
            <MessageSender key={message?._id} message={message} />
          ) : (
            <MessageReceiver key={message?._id} message={message} />
          )
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-4 p-4">
        <Smile
          onClick={() => console.log("Smile clicked")}
          className="text-gray-500 w-8 h-8 hover:cursor-pointer"
        />
        <Paperclip
          onClick={() => console.log("Paperclip clicked")}
          className="text-gray-500 w-8 h-8 hover:cursor-pointer"
        />
        <input
          type="text"
          placeholder={t("dashboard.typeYourMessage")}
          className="w-full p-2 border border-gray-300 rounded"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded hover:cursor-pointer"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
