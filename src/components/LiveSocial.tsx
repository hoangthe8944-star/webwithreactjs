import { useState } from "react";
import LiveFeed from "./LiveFeed";
import ZegoPlayer from "./ZegoPlayer";
import { liveApi } from "../../api/liveApi";

/* ===== TYPES ===== */
interface User {
  id: number;
  username: string;
}

interface LiveSocialProps {
  user: User;
}

/* ===== COMPONENT ===== */
export default function LiveSocial({ user }: LiveSocialProps) {
  const [roomId, setRoomId] = useState<string | null>(null);

  const startLive = async () => {
    const res = await liveApi.startLive(JSON.stringify({
      hostId: user.id,
      hostName: user.username,
      title: `${user.username} đang live`
    }));

    setRoomId(res.data.roomId);
  };

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🔥 Live</h2>

        <button
          onClick={startLive}
          className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
        >
          Go Live
        </button>
      </div>

      {/* FEED */}
      <LiveFeed onJoin={setRoomId} />

      {/* PLAYER POPUP */}
      {roomId && (
        <div className="fixed inset-0 bg-black/80 z-50">
          <ZegoPlayer
            roomId={roomId}
            userId={user.id.toString()}
            userName={user.username}
            isHost={true}
            onLeave={() => setRoomId(null)}
          />
        </div>
      )}
    </div>
  );
}
