"use client";
import useAuth from "@/hooks/useAuth";
import { Info, Mic, Paperclip, Phone, Reply, Send, Smile, Trash2, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MessageSender from "./components/MessageSender";
import MessageReceiver from "./components/MessageReceiver";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarGroup from "../components/AvatarGroup";
import {
  fetchMessages,
  markMessagesAsRead,
} from "@/app/apiClient/chat/message/message";
import { getSocket } from "@/socket/socketClient";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { checkUserOnline } from "@/app/apiClient/user/user";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import EmojiPicker from 'emoji-picker-react';
import getFileIconUrl from "@/utils/getIconTypeAttach";
import { useChat } from "@/hooks/useChat";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export default function ChatDetail() {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const textInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { selectedConversation } = useConversation();
  const [onlineStatus, setOnlineStatus] = useState<boolean>(false);
  const [offlineTime, setOfflineTime] = useState<string | null>(null);
  const router = useRouter();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    sendMessage,
    addMessage,
    setInitialMessages,
    retryMessage,
    setMessages,
    handleRevokeMessage,
    handleDeleteMessage,
    handleToggleLike
  } = useChat(selectedConversation?.id, user);

  const {
    isRecording,
    formattedTime,
    startRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecorder();

  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // ===== INFINITE SCROLL STATE =====
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const isLoadingRef = useRef(false); // Tránh load trùng lặp
  const hasTriggeredLoad = useRef(false); // Đánh dấu đã trigger trong vùng threshold

  // Scroll xuống đáy (tin mới nhất)
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = 0; // Với flex-col-reverse, 0 = đáy
      setShowNewMessageButton(false);
      setNewMessageCount(0);
    }
  };

  // Lắng nghe sự kiện Socket
  useEffect(() => {
    const socket = getSocket();
    const conversationId = selectedConversation?.id;

    // Tham gia room khi vào conversation
    if (conversationId) {
      socket.emit("joinRoom", conversationId);
    }

    // Lắng nghe tin nhắn mới từ server
    socket.on("newMessage", (newMessage: any) => {
      if (newMessage.senderId === user?.id) return;
      addMessage(newMessage);

      if (selectedConversation && user) {
        markMessagesAsRead(selectedConversation.id, user.id);
      }
    });

    // Lắng nghe sự kiện đánh dấu đã đọc
    socket.on("markMessagesAsRead", ({ userId, seenAt, messageIds }: { userId: string; seenAt: string; messageIds: string[] }) => {
      if (setMessages) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (messageIds.includes(msg._id)) {
              const alreadySeen = msg.seens.some((s: any) => s.userId === userId);
              if (!alreadySeen) {
                return {
                  ...msg,
                  seens: [...msg.seens, { userId, seenAt, _id: Date.now().toString() }]
                };
              }
            }
            return msg;
          })
        );
      }
    });

    // Lắng nghe sự kiện thu hồi tin nhắn
    socket.on("messageRevoked", ({ messageId }: { messageId: string }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === messageId) {
            return {
              ...msg,
              revoked: true,
              content: {
                type: "text",
                text: "Tin nhắn đã bị thu hồi",
                images: [],
                file: null,
              },
            };
          }
          return msg;
        })
      );
    });

    // Lắng nghe sự kiện thả yêu thích tin nhắn
    socket.on("messageReactionUpdated", ({ messageId, likes }: { messageId: string, likes: any[] }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, likes: likes } : msg
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("markMessagesAsRead");
      socket.off("messageRevoked");
      socket.off("messageReactionUpdated");
      if (conversationId) {
        socket.emit("leaveRoom", conversationId);
      }
    };
  }, [user?.id, selectedConversation?.id, addMessage, setMessages]);

  // Hàm lấy tin nhắn từ server (LOAD TRANG ĐẦU)
  useEffect(() => {
    const fetchDataMessages = async () => {
      const conversationId = selectedConversation?.id;
      if (!conversationId) return;

      // Reset state khi chuyển conversation
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoad(true);

      const data = await fetchMessages(conversationId, 1, 20);
      setInitialMessages(data);

      // Nếu số tin nhắn trả về < 20 => không còn tin cũ
      if (data.length < 20) {
        setHasMore(false);
      }

      if (user) {
        await markMessagesAsRead(conversationId, user.id);
      }
    };
    fetchDataMessages();
  }, [selectedConversation?.id, setInitialMessages, user]);

  // Auto scroll xuống đáy khi load trang đầu
  useEffect(() => {
    if (initialLoad && messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setInitialLoad(false);
    }
  }, [messages, initialLoad]);

  // XỬ LÝ INFINITE SCROLL
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !selectedConversation?.id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    // QUAN TRỌNG: Tìm tin nhắn đầu tiên đang hiển thị làm điểm neo
    const container = messagesContainerRef.current;
    let anchorMessage: HTMLElement | null = null;
    let anchorOffsetTop = 0;

    if (container) {
      // Tìm tin nhắn đầu tiên trong viewport
      const messages = container.querySelectorAll('[data-message-id]');
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i] as HTMLElement;
        const rect = msg.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Tìm tin nhắn đầu tiên có thể nhìn thấy
        if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
          anchorMessage = msg;
          anchorOffsetTop = msg.offsetTop;
          break;
        }
      }
    }

    try {
      const nextPage = currentPage + 1;
      const olderMessages = await fetchMessages(selectedConversation.id, nextPage, 20);

      if (olderMessages.length < 20) {
        setHasMore(false);
      }

      if (olderMessages.length > 0) {
        // LỌC BỎ tin nhắn trùng lặp trước khi thêm vào
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m._id));
          const newMessages = olderMessages.filter((m: any) => !existingIds.has(m._id));

          return [...prev, ...newMessages];
        });
        setCurrentPage(nextPage);

        // SAU KHI render xong, điều chỉnh scroll dựa vào điểm neo
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (container && anchorMessage) {
              const newAnchorOffsetTop = anchorMessage.offsetTop;
              const offsetDiff = newAnchorOffsetTop - anchorOffsetTop;

              // Điều chỉnh scroll để giữ tin nhắn neo ở vị trí cũ
              container.scrollTop = container.scrollTop - offsetDiff;

              // Reset flag sau khi hoàn tất
              setTimeout(() => {
                hasTriggeredLoad.current = false;
              }, 100);
            }
          });
        });
      } else {
        hasTriggeredLoad.current = false;
      }
    } catch (error) {
      console.error("❌ Lỗi load more:", error);
      hasTriggeredLoad.current = false;
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  // Detect scroll to top - LOGIC GIỐNG ZALO
  const handleScroll = () => {
    const container = messagesContainerRef.current;

    if (!container || isLoadingRef.current || isLoadingMore || !hasMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Khoảng cách từ vị trí hiện tại đến đỉnh thật (tin cũ nhất)
    const distanceFromTop = Math.abs(scrollTop) + clientHeight;
    const distanceFromTopEdge = scrollHeight - distanceFromTop;

    // Vùng kích hoạt: còn cách đỉnh <= 200px
    if (distanceFromTopEdge <= 200) {
      // Nếu chưa trigger trong vùng này thì load
      if (!hasTriggeredLoad.current) {
        hasTriggeredLoad.current = true;
        loadMoreMessages();
      }
    } else if (distanceFromTopEdge > 300) {
      // Ra khỏi vùng an toàn (300px) thì reset flag
      if (hasTriggeredLoad.current) {
        hasTriggeredLoad.current = false;
      }
    }
  };

  // Giữ vị trí scroll sau khi load more - BỎ useEffect này vì đã xử lý trong loadMoreMessages
  const handleSendMessage = async () => {
    if (text.trim() === "" && files.length === 0) return;

    sendMessage(text, files, replyingTo);

    setText("");
    setFiles([]);
    setReplyingTo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Kiểm tra online status
  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (!selectedConversation?.members || !user) return;

      const otherMembers = selectedConversation.members.filter(
        (m: any) => m.id !== user?.id
      );

      if (selectedConversation.type === "private") {
        if (otherMembers.length > 0) {
          const otherMember = otherMembers[0];
          try {
            const res = await checkUserOnline(otherMember.id);
            setOnlineStatus(res.data.isOnline);
            setOfflineTime(res.data.isOnline ? null : res.data.offlineTime);
          } catch (error) {
            console.error("Failed to check user online status:", error);
            setOnlineStatus(false);
            setOfflineTime(null);
          }
        }
      } else {
        if (otherMembers.length > 0) {
          try {
            const statusPromises = otherMembers.map((member: any) =>
              checkUserOnline(member.id)
            );
            const statusResults = await Promise.all(statusPromises);
            const isAnyoneOnline = statusResults.some(
              (res) => res.data.isOnline
            );

            setOnlineStatus(isAnyoneOnline);
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
  }, [selectedConversation, user?.id]);

  // Hàm xử lý bắt đầu cuộc gọi
  const handleStartCall = () => {
    if (!onlineStatus) {
      const message =
        selectedConversation?.type === "private"
          ? `${t("chat.user_noOnline")}`
          : `${t("chat.users_noOnline")}`;
      toast.info(message, { autoClose: 1000 });
      return;
    }

    const socket = getSocket();
    const callPayload = {
      conversationId: selectedConversation?.id,
      callerId: user?.id,
      callerName: user?.name,
      members: selectedConversation?.members,
    };

    socket.emit("startCall", callPayload);
    router.push(`/room/${selectedConversation?.id}`);
  };

  // Ẩn hiện emoji picker
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

  // Xử lý trả lời tin nhắn
  const handleReply = (message: any) => {
    setReplyingTo(message);
    fileInputRef.current?.focus();
  };

  // Xử lý dừng ghi âm và gửi file
  const handleStopAndSend = async () => {
    const audioFile = await stopRecording(); // Chờ hook trả về file

    if (audioFile) {
      // Gọi hàm gửi tin nhắn có sẵn của bạn
      sendMessage("", [audioFile], replyingTo);
    }
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
                  {user?.name?.charAt(0)}
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
                {onlineStatus ? `${t("chat.isOnline")}` : offlineTime || ""}
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

      {/* Messages container với infinite scroll */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-1 bg-gray-50 relative"
      >
        {messages.map((message, index) => {
          const getSenderId = (msg: any) => {
            if (!msg) return null;
            const id = msg.senderId || msg.sender?.id || msg.sender?._id;
            return String(id);
          };

          const currentSenderId = getSenderId(message);
          const myId = String(user?.id);
          const isMe = currentSenderId === myId;

          const olderMessage = messages[index + 1];
          const newerMessage = messages[index - 1];

          const olderSenderId = getSenderId(olderMessage);
          const newerSenderId = getSenderId(newerMessage);

          const isSameSenderAsOlder = olderSenderId === currentSenderId;
          const showAvatar = !olderMessage || !isSameSenderAsOlder;

          const isSameSenderAsNewer = newerSenderId === currentSenderId;
          const showTimestamp = index === 0 || !isSameSenderAsNewer;
          const isLastInSequence = showTimestamp;

          return (
            <div key={message._id} data-message-id={message._id}>
              {isMe ? (
                <MessageSender
                  message={message}
                  onRetry={() => retryMessage(message._id)}
                  showTimestamp={showTimestamp}
                  isLastInSequence={isLastInSequence}
                  onReply={() => handleReply(message)}
                  onRevoke={() => handleRevokeMessage(message._id)}
                  onDelete={() => handleDeleteMessage(message._id)}
                  onLike={() => handleToggleLike(message._id)}
                />
              ) : (
                <MessageReceiver
                  message={message}
                  showTimestamp={showTimestamp}
                  showAvatar={showAvatar}
                  isLastInSequence={isLastInSequence}
                  onReply={() => handleReply(message)}
                  onDelete={() => handleDeleteMessage(message._id)}
                  onLike={() => handleToggleLike(message._id)}
                />
              )}
            </div>
          );
        })}

        {/* Loading indicator khi đang tải tin cũ */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Thông báo hết tin nhắn */}
        {!hasMore && messages.length > 0 && (
          <div className="text-center text-gray-400 py-4 text-sm">
            Đã hiển thị tất cả tin nhắn
          </div>
        )}

        {/* Nút "Tin nhắn mới" khi có tin mới và đang xem tin cũ */}
        {showNewMessageButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2 z-20 animate-bounce"
          >
            <span className="text-sm font-medium">
              {newMessageCount > 1
                ? `${newMessageCount} tin nhắn mới`
                : "Tin nhắn mới"}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Input area */}
      <form
        className="flex items-center gap-4 p-4 relative"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        {replyingTo && (
          <div className="absolute bottom-full left-0 w-full bg-gray-50 border-t border-gray-200 p-2 flex justify-between items-center z-10 shadow-sm animate-in slide-in-from-bottom-2">
            <div className="flex flex-col border-l-4 border-blue-500 pl-3 max-w-[90%]">
              <div className="flex items-center gap-2">
                <Reply size={12} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-600">
                  Trả lời {replyingTo.sender?.name || "Người dùng"}
                </span>
              </div>
              <span className="text-sm text-gray-600 truncate mt-0.5">
                {replyingTo.content.text || (replyingTo.content.images?.length ? "[Hình ảnh]" : "[File]")}
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {isRecording ? (
          // UI GHI ÂM
          <div className="flex-1 flex items-center gap-4 bg-gray-100 p-2 rounded-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-red-500 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">{formattedTime}</span> {/* Dùng biến từ hook */}
            </div>
            <span className="flex-1 text-gray-500 text-sm">Đang ghi âm...</span>

            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-full hover:text-red-500 transition"
            >
              <Trash2 size={20} />
            </button>

            <button
              type="button"
              onClick={handleStopAndSend} // Gọi hàm wrapper
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <>
            <Smile
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-gray-500 w-8 h-8 hover:cursor-pointer"
            />

            {showEmojiPicker && (
              <div ref={emojiRef} className="absolute bottom-20 left-2 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setText((prev) => prev + emojiData.emoji);
                  }}
                />
              </div>
            )}

            <Paperclip
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 w-8 h-8 hover:cursor-pointer"
            />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFileChange(e)}
              accept="image/*,video/*,application/pdf,.doc,.docx,.xlsx,.zip,.rar"
            />
            {files.length > 0 && (
              <div className="absolute bottom-16 left-2 z-50 flex gap-2 p-2 flex-wrap">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center gap-2 w-40 p-2 bg-gray-300 rounded"
                  >
                    <img
                      src={getFileIconUrl(file)}
                      alt={file.name}
                      className="w-6 h-6 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              ref={textInputRef}
              placeholder={t("dashboard.typeYourMessage")}
              className="w-full p-2 border border-gray-300 rounded"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {text.trim() || files.length > 0 ? (
              <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:cursor-pointer"> <Send size={20} /> </button>
            ) : (
              <button
                type="button"
                onClick={startRecording} // Gọi hàm từ hook
                className="p-2 bg-gray-200 text-gray-700 rounded hover:cursor-pointer"
              >
                <Mic size={24} />
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}