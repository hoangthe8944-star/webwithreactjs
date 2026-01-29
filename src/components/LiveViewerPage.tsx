import React from "react";
import ZegoPlayer from "./ZegoPlayer";

interface LiveHostPageProps {
  roomId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
}

const LiveHostPage: React.FC<LiveHostPageProps> = ({
  roomId,
  userId,
  userName,
  onLeave,
}) => {
  return (
    <div className="w-full h-full relative">
      <button
        onClick={onLeave}
        className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded z-50"
      >
        Thoát
      </button>

      <ZegoPlayer
        roomId={roomId}
        userId={userId}
        userName={userName}
        isHost={false}
        onLeave={() => {
          // quay về feed / đóng player
          window.history.back();
        }}
      />
    </div>
  );
};

export default LiveHostPage;
