"use client";

import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// !!! ======================================================= !!!
// !!!                     CẢNH BÁO BẢO MẬT                     !!!
// !!!         KHÔNG BAO GIỜ SỬ DỤNG CODE NÀY KHI DEPLOY        !!!
// !!!         ServerSecret sẽ bị lộ cho TẤT CẢ người dùng       !!!
// !!! ======================================================= !!!

// Dán thông tin của bạn lấy từ Zego dashboard vào đây
const APP_ID = 615480249;
const SERVER_SECRET = "6591e01fe5241fdfbd2262b4bfcd7ebd";
// (Hãy sao chép chuỗi '659a1e01fef52...4fcd7d1abd' từ Zego dashboard của bạn)

export default function ZegoCall({ user, roomID, callType, onLeave }: any) {
  const meetingRef = useRef(null);

  useEffect(() => {
    if (!user || !roomID || !meetingRef.current) return;

    let zp: any;

    try {
      // 1. Tạo token (KHÔNG AN TOÀN - CHỈ DÙNG LOCAL)
      const userID = user.id.toString();
      const userName = user.name;
      const effectiveTimeInSeconds = 3600; // 1 giờ
      const payload = "";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        user.id,
        user.name,
        roomID,
        effectiveTimeInSeconds
      );

      // 2. Khởi tạo Zego UI Kit
      zp = ZegoUIKitPrebuilt.create(kitToken);

      // 3. Tham gia phòng
      zp.joinRoom({
        container: meetingRef.current,
        scenario: {
          // Dùng chế độ One-on-one call hoặc Group call
          mode: ZegoUIKitPrebuilt.OneONoneCall,
          // Hoặc: mode: ZegoUIKitPrebuilt.GroupCall,
        },

        // --- Cấu hình dựa trên callType ---
        turnOnCameraWhenJoining: callType === "video", // Bật camera nếu là video call
        turnOnMicrophoneWhenJoining: true, // Luôn bật mic khi vào
        showMyCameraToggleButton: callType === "video", // Chỉ hiện nút bật/tắt camera nếu là video call
        showAudioVideoSettingsButton: callType === "video", // Chỉ hiện nút cài đặt A/V nếu là video call
        // ---------------------------------

        onLeaveRoom: () => {
          onLeave();
        },
        // Tắt nút chia sẻ link mời (vì đây là chat 1-1 hoặc nhóm cố định)
        sharedLinks: [],
      });
    } catch (error) {
      console.error("Lỗi khi khởi tạo Zego UI Kit: ", error);
    }

    return () => {
      if (zp) {
        console.log("[ZEGOCLOUD] Hủy instance cũ...");
        zp.destroy(); // Hủy instance cũ đi
      }
    };
  }, [user, roomID, callType, onLeave]);

  return (
    <div
      ref={meetingRef}
      style={{ width: "100%", height: "100%" }} // Để nó lấp đầy component cha
    />
  );
}
