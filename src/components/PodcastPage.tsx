import { useState, useEffect } from 'react';
import { Play, Mic, Radio, Headphones, Cast, Signal, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import axios from 'axios';
import { BASE_URL } from '../../api/apiconfig';
import { cn } from './lib/utils';

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

  // Dữ liệu tĩnh (giữ nguyên)
  const categories = [
    { id: 'all', label: 'Tất cả', icon: Mic },
    { id: 'tech', label: 'Công nghệ', icon: Radio },
    { id: 'edu', label: 'Giáo dục', icon: Headphones },
    { id: 'ent', label: 'Giải trí', icon: Cast },
  ];

  const featuredPodcasts: Podcast[] = [
    // giữ nguyên dữ liệu mẫu của bạn
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
    // giữ nguyên
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

  // Fetch live rooms (giữ nguyên logic)
  useEffect(() => {
    const fetchLiveRooms = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await axios.get(`${BASE_URL}/api/live/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-5 sm:px-6 lg:px-10 py-8 space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-pink-500 to-purple-500">
            Podcast & Live
          </h1>
          <p className="mt-1.5 text-slate-400">Khám phá nội dung âm thanh trực tiếp và theo yêu cầu</p>
        </div>

        <Button
          onClick={() => onJoinLiveRoom("", true)}
          size="lg"
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-900/30 transition-all duration-300 group"
        >
          <Signal className="w-5 h-5 mr-2 group-hover:animate-pulse" />
          Bắt đầu phát trực tiếp
        </Button>
      </header>

      {/* Categories */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-full",
              "bg-white/5 hover:bg-white/10 border border-white/10",
              "text-sm font-medium text-white transition-all duration-200",
              "hover:border-white/20 active:scale-95"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── LIVE NOW ──────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Đang phát trực tiếp</h2>
          {liveRooms.length > 0 && (
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-red-400/30"></span>
            </div>
          )}
        </div>

        {liveRooms.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl p-10 text-center border border-slate-700/50">
            <Users className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <p className="text-lg text-slate-400 font-medium">
              Hiện chưa có phòng live nào đang hoạt động
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveRooms.map((room) => (
              <div
                key={room.roomId}
                className={cn(
                  "group relative bg-gradient-to-br from-red-950/60 via-black/70 to-slate-950/80",
                  "rounded-2xl overflow-hidden border border-red-800/30 hover:border-red-600/60",
                  "p-5 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex gap-4">
                  <div className="shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-red-900/50 to-black flex items-center justify-center">
                    <Signal className="w-9 h-9 text-red-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-red-300 transition-colors">
                      {room.roomTitle}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300/80">
                      {room.hostName}
                    </p>

                    <Button
                      onClick={() => onJoinLiveRoom(room.roomId, false)}
                      size="sm"
                      className="mt-4 bg-red-600 hover:bg-red-700 shadow-md shadow-red-900/40 text-sm"
                    >
                      Vào phòng ngay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── FEATURED ──────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight">Nổi bật hôm nay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {featuredPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="group bg-white/5 hover:bg-white/8 rounded-2xl p-5 transition-all duration-300 border border-white/5 hover:border-white/15 flex gap-5"
            >
              <div className="shrink-0">
                <ImageWithFallback
                  src={podcast.cover}
                  alt={podcast.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-lg shadow-black/40 group-hover:shadow-xl group-hover:shadow-black/50 transition-shadow"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {podcast.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{podcast.host}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} /> {podcast.duration}
                  </div>
                  <span>•</span>
                  <span>{podcast.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRENDING ──────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight">Xu hướng</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {trendingPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.03]"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/30 group-hover:shadow-xl group-hover:shadow-black/50 transition-shadow">
                <ImageWithFallback
                  src={podcast.cover}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="mt-3 font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                {podcast.title}
              </h3>
              <p className="text-sm text-slate-400 truncate">{podcast.host}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}