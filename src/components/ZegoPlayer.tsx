import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

interface Props {
  roomId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
  isHost?: boolean;
}

export default function ZegoPlayer({
  roomId,
  userId,
  userName,
  onLeave,
  isHost = false
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const joined = useRef(false);

  // THAY THÔNG TIN CỦA BẠN VÀO ĐÂY
  const appID = 579313809; // <-- Thay bằng AppID (kiểu số) từ Zego Admin Console
  const serverSecret = "25e0fb5f81c9348526c1120c412c037c"; // <-- Thay bằng ServerSecret (kiểu chuỗi)

  useEffect(() => {
    if (joined.current) return;

    const join = async () => {
      try {
        console.log("--- BẮT ĐẦU KHỞI TẠO ZEGO ---");

        // 1. TẠO KIT TOKEN TẠI FRONTEND (Để tránh lỗi từ Backend)
        // Cách này đảm bảo token luôn đúng định dạng cho UI Kit
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName
        );

        console.log("Kit Token đã được tạo thành công!");

        // 2. Khởi tạo Zego Cloud
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;
        joined.current = true;

        // 3. Cấu hình join phòng
        zp.joinRoom({
          container: ref.current!,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: isHost ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience,
            },
          },
          showPreJoinView: false,
          turnOnCameraWhenJoining: isHost,
          turnOnMicrophoneWhenJoining: isHost,
          showUserList: true,
          onLeaveRoom: () => handleCleanup(),
        });

      } catch (err: any) {
        console.error("QUÁ TRÌNH JOIN THẤT BẠI:", err);
        alert("Lỗi Zego: " + err.message);
        onLeave();
      }
    };

    const handleCleanup = () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
      joined.current = false;
      onLeave();
    };

    join();

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [roomId, userId]);

  return (
    <div className="w-full h-screen relative bg-slate-900 flex flex-col">
      <button
        onClick={() => {
          if (zpRef.current) zpRef.current.destroy();
          onLeave();
        }}
        className="absolute top-4 right-4 z-[9999] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg"
      >
        THOÁT LIVE
      </button>
      <div ref={ref} className="flex-1 w-full h-full" />
    </div>
  );
}