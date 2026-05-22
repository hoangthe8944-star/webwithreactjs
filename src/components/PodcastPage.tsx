import { useEffect, useState } from 'react';
import {
  Cast,
  Clock,
  Headphones,
  Mic,
  Radio,
  Signal,
  Sparkles,
  Users,
  Waves
} from 'lucide-react';
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
}

interface LiveRoom {
  roomId: string;
  roomTitle?: string;
  hostName?: string;
}

interface PodcastPageProps {
  onJoinLiveRoom: (roomId: string, isHost: boolean) => void;
}

export function PodcastPage({ onJoinLiveRoom }: PodcastPageProps) {
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);

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
      description: 'Bản tin âm thanh ngắn gọn để mở đầu ngày mới với những câu chuyện lớn nhất.',
      duration: '25 min',
      date: 'Hôm nay'
    },
    {
      id: 'p2',
      title: 'TED Radio Hour',
      host: 'NPR',
      category: 'Education',
      cover: 'https://images.unsplash.com/photo-1478737270239-2f52b27fa34e?q=80&w=1080',
      description: 'Những ý tưởng lớn được kể lại bằng giọng nói truyền cảm và dễ nghe.',
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
      description: 'Một thư viện kiến thức vui nhộn cho những lúc muốn nghe điều mới mẻ.',
      duration: '45 min'
    },
    {
      id: 't2',
      title: 'Planet Money',
      host: 'NPR',
      category: 'Business',
      cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1080',
      description: 'Kinh tế học được kể lại gọn gàng, dễ hiểu và có tính giải trí.',
      duration: '20 min'
    }
  ];

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
        console.error("Lỗi lấy danh sách live:", err);
      }
    };

    fetchLiveRooms();
    const interval = setInterval(fetchLiveRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_44%,_#020617_100%)] px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">
                <Radio className="h-3.5 w-3.5" />
                Studio Podcast
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Lên sóng podcast trực tiếp trong một không gian gọn, rõ và dễ tham gia.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Bắt đầu một phòng audio live để trò chuyện, chia sẻ chủ đề và để người nghe tham gia ngay
                trên Beatbox mà không cần bố cục video phức tạp.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => onJoinLiveRoom("", true)}
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-6 text-white shadow-lg shadow-rose-900/40 hover:scale-[1.02]"
                >
                  <Signal className="mr-2 h-4 w-4" />
                  Bắt đầu podcast live
                </Button>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                  <Headphones className="h-4 w-4 text-cyan-300" />
                  {liveRooms.length} phòng đang phát
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3 text-rose-200">
                  <Mic className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Chế độ host</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Vào phòng với micro mở sẵn, giao diện tập trung vào nội dung âm thanh.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3 text-cyan-200">
                  <Waves className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Ưu tiên âm thanh</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Không bật camera mặc định, phù hợp với định dạng live kiểu podcast.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3 text-amber-200">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Thính giả</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Người nghe có thể vào phòng nhanh để theo dõi buổi live đang diễn ra.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex gap-2.5 overflow-x-auto pb-1">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-all duration-200",
                index === 0
                  ? "border-rose-400/40 bg-rose-500/15 text-white shadow-lg shadow-rose-950/20"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-rose-300/28 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.24),transparent_24%),linear-gradient(180deg,rgba(190,24,93,0.18),rgba(15,23,42,0.88)_24%,rgba(2,6,23,0.96)_100%)] p-5 shadow-[0_28px_90px_rgba(244,63,94,0.2)] sm:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-black/6" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-rose-200">
                  <Signal className="h-4 w-4" />
                  Đang lên sóng
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Phòng live podcast</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-50/75">
                  Khu vực ưu tiên cho các buổi phát trực tiếp đang diễn ra ngay lúc này. Chọn một phòng để vào nghe ngay.
                </p>
              </div>
              {liveRooms.length > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 shadow-lg shadow-rose-950/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
                  </span>
                  LIVE NGAY
                </div>
              )}
            </div>

            {liveRooms.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-600" />
                <h3 className="mt-4 text-lg font-semibold text-white">Chưa có phòng nào đang phát</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Bạn có thể là người đầu tiên bắt đầu một buổi trò chuyện audio trực tiếp cho cộng đồng.
                </p>
                <Button
                  onClick={() => onJoinLiveRoom("", true)}
                  className="mt-6 rounded-full bg-white text-slate-950 hover:bg-slate-200"
                >
                  Tạo phòng ngay
                </Button>
              </div>
            ) : (
              <div className="relative mt-6 grid gap-4">
                {liveRooms.map((room, index) => (
                  <button
                    key={room.roomId}
                    onClick={() => onJoinLiveRoom(room.roomId, false)}
                    className={cn(
                      "group relative grid w-full gap-4 overflow-hidden rounded-[28px] border p-4 text-left transition-all duration-300 sm:grid-cols-[auto_1fr_auto] sm:items-center",
                      index === 0
                        ? "min-h-[220px] border-rose-200/55 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(251,113,133,0.24),transparent_30%),linear-gradient(135deg,rgba(225,29,72,0.88),rgba(190,24,93,0.9)_38%,rgba(127,29,29,0.84)_62%,rgba(30,41,59,0.82)_100%)] shadow-[0_24px_90px_rgba(244,63,94,0.34)] ring-1 ring-rose-100/30 hover:-translate-y-1.5 hover:shadow-[0_34px_110px_rgba(244,63,94,0.42)]"
                        : "border-white/8 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.8))] hover:-translate-y-0.5 hover:border-rose-400/40 hover:shadow-lg hover:shadow-rose-950/20"
                    )}
                  >
                    {index === 0 && <div className="pointer-events-none absolute inset-0 bg-black/4" />}
                    {index === 0 && (
                      <>
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-400/20 blur-3xl" />
                        <div className="absolute left-6 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-black/20">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-300 opacity-80" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-300" />
                          </span>
                          Nổi bật nhất
                        </div>
                      </>
                    )}

                    <div className={cn(
                      "relative flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-white/10",
                      index === 0
                        ? "bg-gradient-to-br from-white/22 via-rose-200/18 to-orange-200/12 shadow-lg shadow-rose-950/35"
                        : "bg-gradient-to-br from-rose-500/25 to-orange-400/15"
                    )}>
                      <Radio className={cn("h-7 w-7", index === 0 ? "text-white" : "text-rose-300")} />
                    </div>

                    <div className={cn("relative z-10 min-w-0", index === 0 && "pt-8 sm:pt-0")}>
                      <div className={cn(
                        "flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]",
                        index === 0 ? "text-rose-100" : "text-rose-200"
                      )}>
                        <span className={cn("h-2 w-2 rounded-full", index === 0 ? "bg-white" : "bg-rose-400")} />
                        Podcast live
                      </div>
                      <h3 className={cn(
                        "mt-2 truncate font-semibold text-white",
                        index === 0 ? "text-2xl sm:text-3xl" : "text-lg"
                      )}>
                        {room.roomTitle || 'Phòng podcast trực tiếp'}
                      </h3>
                      <p className={cn(
                        "mt-1 truncate",
                        index === 0 ? "text-base font-medium text-rose-50/95" : "text-sm text-slate-300"
                      )}>
                        Host: {room.hostName || 'Đang cập nhật'}
                      </p>
                      {index === 0 && (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-rose-50/90">
                          Buổi trò chuyện đang thu hút người nghe ngay lúc này. Vào phòng để theo dõi trực tiếp và nghe host chia sẻ.
                        </p>
                      )}
                    </div>

                    <div className={cn(
                      "relative z-10 flex items-center gap-3 self-start sm:self-center",
                      index === 0 && "sm:flex-col sm:items-end"
                    )}>
                      <div className={cn(
                        "hidden rounded-full border px-3 py-1 text-xs sm:block",
                        index === 0
                          ? "border-white/25 bg-white/12 text-white"
                          : "border-white/10 bg-white/5 text-slate-300"
                      )}>
                        Phòng {room.roomId}
                      </div>
                      <span className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                        index === 0
                          ? "bg-white text-rose-700 shadow-lg shadow-rose-950/20 group-hover:bg-rose-50"
                          : "bg-rose-500 text-white group-hover:bg-rose-400"
                      )}>
                        Vào nghe
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Gợi ý format
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Hỏi đáp nhanh với khán giả theo chủ đề trong 20-30 phút.</li>
                <li>Bản tin âm nhạc hằng tuần với tin mới, review và chia sẻ playlist.</li>
                <li>Phòng tâm sự của nghệ sĩ, creator hoặc host có khách mời.</li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                <Clock className="h-4 w-4" />
                Nổi bật hôm nay
              </div>
              <div className="mt-4 grid gap-4">
                {featuredPodcasts.map((podcast) => (
                  <div
                    key={podcast.id}
                    className="flex gap-4 rounded-3xl border border-white/8 bg-black/20 p-3"
                  >
                    <ImageWithFallback
                      src={podcast.cover}
                      alt={podcast.title}
                      className="h-16 w-16 rounded-2xl object-cover sm:h-[72px] sm:w-[72px]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{podcast.category}</p>
                      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-white">{podcast.title}</h3>
                      <p className="mt-1 text-sm text-slate-300">{podcast.host}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-400">{podcast.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Headphones className="h-4 w-4" />
                Xu hướng nghe
              </div>
              <h2 className="mt-2 text-2xl font-bold">Một vài podcast để bắt đầu</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {trendingPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="group rounded-[24px] border border-white/8 bg-black/20 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-black/30"
              >
                <div className="mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-2xl sm:max-w-[150px]">
                  <ImageWithFallback
                    src={podcast.cover}
                    alt={podcast.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 truncate text-sm font-semibold text-white sm:text-base">{podcast.title}</h3>
                <p className="mt-1 truncate text-sm text-slate-400">{podcast.host}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{podcast.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
