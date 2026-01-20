import { useState, useEffect } from 'react';
import { Play, Mic, Radio, Headphones, Cast, Users, Signal, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import axios from 'axios';

interface Podcast {
  id: string;
  title: string;
  host: string;
  category: string;
  cover: string;
  description: string;
  duration?: string;
  date?: string;
  viewers?: string;
  isLive?: boolean;
}

interface PodcastPageProps {
  onJoinLiveRoom: (roomId: string, isHost: boolean) => void;
}

export function PodcastPage({ onJoinLiveRoom }: PodcastPageProps) {
  const [liveRooms, setLiveRooms] = useState<any[]>([]);

  // 1. Dữ liệu mẫu (Cần thiết để fix lỗi "Cannot find name")
  const categories = [
    { id: 'all', label: 'Tất cả', icon: Mic },
    { id: 'tech', label: 'Công nghệ', icon: Radio },
    { id: 'edu', label: 'Giáo dục', icon: Headphones },
    { id: 'ent', label: 'Giải trí', icon: Cast },
  ];

  const featuredPodcasts: Podcast[] = [
    {
      id: 'p1',
      title: 'The Daily',
      host: 'The New York Times',
      category: 'News',
      cover: 'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1080',
      description: 'Tin tức hàng ngày từ NYT.',
      duration: '25 min',
      date: 'Hôm nay'
    },
    {
      id: 'p2',
      title: 'TED Radio Hour',
      host: 'NPR',
      category: 'Education',
      cover: 'https://images.unsplash.com/photo-1478737270239-2f52b27fa34e?q=80&w=1080',
      description: 'Ý tưởng đáng lan truyền.',
      duration: '50 min',
      date: 'Hôm qua'
    }
  ];

  const trendingPodcasts: Podcast[] = [
    {
      id: 't1',
      title: 'Stuff You Should Know',
      host: 'iHeartRadio',
      category: 'Education',
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1080',
      description: 'Tìm hiểu về mọi thứ.',
      duration: '45 min'
    },
    {
      id: 't2',
      title: 'Planet Money',
      host: 'NPR',
      category: 'Business',
      cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1080',
      description: 'Kinh tế học giải thích thế giới.',
      duration: '20 min'
    }
  ];

  // 2. Lấy dữ liệu Livestream thật từ Backend
  useEffect(() => {
    const fetchLiveRooms = async () => {
      try {
        const token = sessionStorage.getItem("accessToken"); // Lấy token
        const res = await axios.get("http://localhost:8081/api/live/active", {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token ở đây
            "ngrok-skip-browser-warning": "true"
          }
        });
        setLiveRooms(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách Live:", err);
      }
    };
    fetchLiveRooms();
    const interval = setInterval(fetchLiveRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header & Categories */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">Podcast & Live</h1>
          <Button
            onClick={() => onJoinLiveRoom("", true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            <Signal className="w-4 h-4 mr-2" /> Bắt đầu Live
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat.id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white hover:bg-white/10 whitespace-nowrap">
              <cat.icon className="w-4 h-4" /> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Now Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-white">Đang phát trực tiếp</h2>
          {liveRooms.length > 0 && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>

        {liveRooms.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center text-slate-400 border border-dashed border-white/10">
            Hiện chưa có phòng nào đang phát sóng.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveRooms.map((room) => (
              <div key={room.roomId} className="bg-gradient-to-r from-red-900/40 to-black/40 rounded-xl overflow-hidden border border-red-500/20 p-4 hover:border-red-500/50 transition-all">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-slate-800 flex items-center justify-center text-red-500">
                    <Signal size={40} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{room.roomTitle}</h3>
                    <p className="text-sm text-white/60 mb-3">Host: {room.hostName}</p>
                    <Button onClick={() => onJoinLiveRoom(room.roomId, false)} className="h-8 bg-red-600 hover:bg-red-700 text-xs">
                      Vào xem ngay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Nổi bật hôm nay</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredPodcasts.map((podcast) => (
            <div key={podcast.id} className="bg-white/5 p-4 rounded-xl flex gap-4 hover:bg-white/10 transition-colors">
              <ImageWithFallback src={podcast.cover} alt={podcast.title} className="w-20 h-20 rounded-lg object-cover" />
              <div>
                <h3 className="font-bold text-white">{podcast.title}</h3>
                <p className="text-sm text-slate-400">{podcast.host}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2">
                  <Clock size={12} /> {podcast.duration} • {podcast.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Xu hướng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingPodcasts.map((podcast) => (
            <div key={podcast.id} className="group cursor-pointer">
              <div className="aspect-square rounded-xl overflow-hidden mb-2">
                <ImageWithFallback src={podcast.cover} alt={podcast.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="font-semibold text-white truncate">{podcast.title}</h3>
              <p className="text-xs text-slate-400">{podcast.host}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}