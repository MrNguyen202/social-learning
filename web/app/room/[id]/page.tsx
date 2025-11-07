"use client";

import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { getSocket } from "@/socket/socketClient";
import useAuth from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/contexts/LanguageContext";

// ĐOẠN CODE ẨN LỖI CONSOLE
// Chỉ chạy trên client
if (typeof window !== "undefined") {
  const originalConsoleError = console.error; // Lưu lại hàm console.error gốc

  console.error = (...args) => {
    // Kiểm tra xem argument đầu tiên có phải là string không
    if (typeof args[0] === "string") {
      // Nếu có chứa chuỗi lỗi, thì "return" (không làm gì cả)
      // Điều này sẽ ngăn Next.js phát hiện lỗi
      if (args[0].includes("unknown cmd: play_event")) {
        return;
      }
    }

    // Đối với tất cả các lỗi khác, gọi hàm console.error gốc
    originalConsoleError.apply(console, args);
  };
}

function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentUserId = user?.id;
    const currentUserName = user?.name;

    if (!currentUserId || !currentUserName) {
      console.error("User ID và User Name là bắt buộc");
      return;
    }

    const socket = getSocket();

    // Thông báo cho server là bạn đã vào phòng chờ cuộc gọi
    socket.emit("joinCallRoom", id?.toString());

    let zp: ZegoUIKitPrebuilt | null = null;

    const myMeeting = async (element: HTMLDivElement) => {
      const appID = 615480249;
      const serverSecret = "6591e01fe5241fdfbd2262b4bfcd7ebd";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        id?.toString() || "",
        currentUserId,
        currentUserName
      );

      zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: "Copy Link",
            url:
              window.location.protocol +
              "//" +
              window.location.host +
              "/room/" +
              id,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        maxUsers: 10,
        onLeaveRoom: () => {
          console.log("[ZEGO] Left room");
        },
      });
    };

    socket.on("callDeclined", ({ declinerId }: any) => {
      toast.error("Người dùng đã từ chối cuộc gọi.", { autoClose: 1000 });
    });

    myMeeting(containerRef.current);

    // hàm cleanup
    // Hàm này sẽ chạy khi component unmount
    return () => {
      socket.off("callDeclined");
      // Thông báo cho server là bạn rời phòng chờ
      socket.emit("leaveCallRoom", id?.toString());
      if (zp) {
        zp.destroy();
      }
    };
  }, [id, user, router]);

  return (
    <>
      <div className="h-full w-full" ref={containerRef}></div>
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> {t("learning.back")}
        </Button>
      </div>
    </>
  );
}

export default Page;
