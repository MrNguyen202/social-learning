"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    receiver: {
        id: string;
        name: string;
        nick_name?: string;
        avatar?: string;
    };
    onSend: (message: string) => Promise<void> | void;
}

export default function MessageModal({
    isOpen,
    onClose,
    receiver,
    onSend,
}: MessageModalProps) {
    const { t } = useLanguage();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const chatSuggestions = [
        t("chat.hello") || "Chào bạn 👋",
        t("chat.nice_to_meet") || "Rất vui được làm quen 😄",
        t("chat.ask_exchange") || "Mình có thể trao đổi thêm được không?",
        t("chat.invite_talk") || "Bạn rảnh nói chuyện chút không?",
    ];

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            await onSend(message);
            setMessage("");
            onClose();
        } catch (err) {
            console.error("Send message failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (text: string) => {
        setMessage(text);
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-11/12 max-w-md p-5"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border">
                            <AvatarImage
                                src={
                                    receiver.avatar
                                        ? getUserImageSrc(receiver.avatar)
                                        : "/default-avatar-profile-icon.jpg"
                                }
                                alt={receiver.name}
                            />
                        </Avatar>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold leading-tight">
                                {receiver.name}
                            </h2>
                            {receiver.nick_name && (
                                <p className="text-sm text-muted-foreground">
                                    @{receiver.nick_name}
                                </p>
                            )}
                            {
                                false ? (
                                    <p className="text-xs text-green-600 mt-0.5">
                                        ● {t("dashboard.online")}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        ● {t("dashboard.offline")}
                                    </p>
                                )
                            }
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full p-1"
                    >
                        <X className="w-5 h-5 text-gray-500 hover:text-black dark:hover:text-white" />
                    </button>
                </div>

                <hr className="my-2 border-border" />

                {/* Message box */}
                <Textarea
                    placeholder={t("chat.let_send_message") || "Hãy gửi một tin nhắn"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] mb-4 resize-none"
                />

                {/* Quick chat suggestions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {chatSuggestions.map((suggestion, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full text-gray-700 dark:text-gray-200 transition"
                        >
                            {suggestion}
                        </motion.button>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSend}
                        disabled={loading || !message.trim()}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <Send className="w-4 h-4 animate-pulse" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {t("chat.sendMessage")}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
