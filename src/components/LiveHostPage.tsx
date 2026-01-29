import React, { useState } from "react";
import ZegoPlayer from "./ZegoPlayer";
import { liveApi } from "../../api/liveApi";

interface Props {
  userId: string;
  userName: string;
  onEnd: () => void;
}

const LiveHostPage: React.FC<Props> = ({ userId, userName, onEnd }) => {
  const [title, setTitle] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startLive = async () => {
    if (!title.trim()) {
      alert("Nhập tiêu đề live");
      return;
    }

    try {
      setLoading(true);

      const res = await liveApi.startLive(JSON.stringify({
        hostId: String(userId),
        hostName: userName,
        title,
      }));

      setRoomId(res.data.roomId);
    } catch (err) {
      alert("Không thể bắt đầu live");
    } finally {
      setLoading(false);
    }
  };

  const endLive = async () => {
    if (roomId) {
      try {
        await liveApi.endLive(roomId);
      } catch {}
    }
    setRoomId(null);
    onEnd();
  };

  if (roomId) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 flex justify-between items-center bg-black/40">
          <div className="font-semibold">🔴 Đang live: {title}</div>
          <button
            onClick={endLive}
            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
          >
            Kết thúc
          </button>
        </div>

        <div className="flex-1">
          <ZegoPlayer
            roomId={roomId}
            userId={userId}
            userName={userName}
            isHost
            onLeave={endLive}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Bắt đầu live</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nhập tiêu đề live..."
        className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20 outline-none"
      />

      <button
        disabled={loading}
        onClick={startLive}
        className="w-full py-2 bg-red-500 hover:bg-red-600 rounded font-semibold disabled:opacity-50"
      >
        {loading ? "Đang tạo phòng..." : "Bắt đầu Live"}
      </button>
    </div>
  );
};

export default LiveHostPage;
