import { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { liveApi } from '../../api/liveApi';
import { X } from 'lucide-react';

interface LiveRoomPageProps {
  roomId: string;
  userId: string;
  userName: string;
  isHost: boolean;
  onLeave: () => void;
}

export function LiveRoomPage({ roomId, userId, userName, isHost, onLeave }: LiveRoomPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initZego = async (element: HTMLDivElement) => {
    // 🔴 ĐIỀN THÔNG SỐ ZEGO CỦA BẠN VÀO ĐÂY
    const appID = 579313809; 
    const serverSecret = "25e0fb5f81c9348526c1120c412c037c";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, serverSecret, roomId, userId, userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      scenario: {
        mode: isHost ? ZegoUIKitPrebuilt.LiveStreaming : ZegoUIKitPrebuilt.GroupCall,
        config: { 
            role: isHost ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience 
        },
      },
      showPreJoinView: false,
      onLeaveRoom: () => {
        handleExit();
      },
    });
  };

  const handleExit = async () => {
    if (isHost) {
      try {
        await liveApi.endLive(roomId);
      } catch (err) {
        console.error("Lỗi khi kết thúc live:", err);
      }
    }
    onLeave();
  };

  useEffect(() => {
    if (containerRef.current) {
      initZego(containerRef.current);
    }
    // Cleanup khi component bị gỡ bỏ
    return () => {
        if (isHost) liveApi.endLive(roomId).catch(() => {});
    };
  }, [roomId]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
       <div className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/5">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {isHost ? <span className="text-red-500 animate-pulse">● LIVE</span> : "📺"} 
                    {isHost ? "Phòng của bạn" : `Đang xem: ${userName}`}
                </h2>
                <p className="text-xs text-slate-400">Mã phòng: {roomId}</p>
            </div>
            <button 
                onClick={handleExit}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={24} />
            </button>
       </div>
       
       <div className="flex-1 relative">
            <div ref={containerRef} className="absolute inset-0 w-full h-full"></div>
       </div>
    </div>
  );
}