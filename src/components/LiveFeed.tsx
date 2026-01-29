import React, { useEffect, useState } from "react";
import { liveApi } from "../../api/liveApi";

interface LiveRoom {
  roomId: string;
  hostId: number;
  hostName: string;
  title: string;
}

interface Props {
  onJoin: (roomId: string) => void;
}

const LiveFeed: React.FC<Props> = ({ onJoin }) => {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      const res = await liveApi.getActiveRooms();
      setRooms(res.data);
    } catch (err) {
      console.error("Load live rooms error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();

    const interval = setInterval(loadRooms, 5000); // auto refresh 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-white/70">
        Đang tải phòng live...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-6 text-center text-white/60">
        Hiện chưa có ai live 😴
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <div
          key={room.roomId}
          className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center font-bold">
              {room.hostName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="font-semibold">{room.hostName}</div>
              <div className="text-xs text-red-400">🔴 LIVE</div>
            </div>
          </div>

          <div className="text-sm text-white/90 mb-3 line-clamp-2">
            {room.title}
          </div>

          <button
            onClick={() => onJoin(room.roomId)}
            className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
          >
            Xem Live
          </button>
        </div>
      ))}
    </div>
  );
};

export default LiveFeed;
