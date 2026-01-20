import axios from "axios";
import { useEffect, useState } from "react";

export function LiveListPage({ onJoinRoom }: { onJoinRoom: (roomId: string) => void }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get("https://backend-jfn4.onrender.com/api/live/active")
      .then(res => setRooms(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🔴 Các phòng đang Livestream</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room: any) => (
          <div key={room.roomId} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all">
            <h3 className="font-bold text-lg">{room.roomTitle}</h3>
            <p className="text-slate-400 text-sm">Host: {room.hostName}</p>
            <button 
              onClick={() => onJoinRoom(room.roomId)}
              className="mt-4 w-full bg-cyan-500 py-2 rounded-lg font-bold hover:bg-cyan-600"
            >
              Vào Xem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}