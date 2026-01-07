import { Heart, MoreHorizontal, ChevronDown, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

// ✅ BƯỚC 1: SỬ DỤNG 'SONG' TYPE TỪ API VÀ IMPORT API
import type { Song } from '../../api/apiclient';
import { getTrendingSongs } from '../../api/apiclient'; // Giả sử có cả API like/unlike

// ✅ BƯỚC 2: MỞ RỘNG PROPS ĐỂ NHẬN THÊM CÁC ĐIỀU KHIỂN
interface NowPlayingProps {
  currentSong: Song | null;
  isPlaying: boolean;
  playQueue: Song[]; // Nhận hàng đợi phát hiện tại từ App.tsx
  
  // Props cho thanh tiến trình
  currentTime: number;
  duration: number;
  
  // Callbacks
  onBack: () => void;
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onSeek: (time: number) => void; // Callback khi người dùng tua nhạc
}

// Hàm tiện ích định dạng thời gian
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};


export function NowPlaying({ 
  currentSong, 
  isPlaying,
  playQueue,
  currentTime,
  duration,
  onBack, 
  onPlaySong,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onSeek
}: NowPlayingProps) {
  
  // ✅ BƯỚC 3: THÊM STATE NỘI BỘ CHO CÁC TÍNH NĂNG TƯƠNG TÁC
  const [isLiked, setIsLiked] = useState(false);
  
  // State để quản lý danh sách "Tiếp theo" một cách độc lập
  const [upNextSongs, setUpNextSongs] = useState<Song[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Logic để hiển thị hàng đợi phát nhạc hoặc một danh sách gợi ý
  useEffect(() => {
    if (!currentSong) return;

    // Ưu tiên hiển thị hàng đợi hiện tại của người dùng
    if (playQueue && playQueue.length > 1) {
      const currentIndex = playQueue.findIndex(s => s.id === currentSong.id);
      // Lấy các bài hát tiếp theo trong hàng đợi
      const nextInQueue = playQueue.slice(currentIndex + 1);
      setUpNextSongs(nextInQueue);
    } else {
      // Nếu không có hàng đợi, gọi API để lấy bài hát gợi ý
      const fetchRecommended = async () => {
        setIsLoadingQueue(true);
        try {
          const response = await getTrendingSongs(10);
          const filtered = response.data.filter(s => s.id !== currentSong.id);
          setUpNextSongs(filtered);
        } catch (error) {
          console.error("Lỗi khi tải danh sách gợi ý:", error);
        } finally {
          setIsLoadingQueue(false);
        }
      };
      fetchRecommended();
    }
  }, [currentSong, playQueue]);

  // Hàm xử lý khi người dùng kéo thanh trượt
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(event.target.value);
    onSeek(time);
  };

  const handleToggleLike = () => {
    // Logic gọi API để like/unlike bài hát
    setIsLiked(!isLiked);
    // Ví dụ: toggleLikeStatus(currentSong.id, !isLiked);
  };
  
  if (!currentSong) {
    // Trả về một giao diện trống hoặc loading nếu chưa có bài hát nào
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <p className="text-white/70">Chưa có bài hát nào được chọn.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-800 to-black text-white">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10"><ChevronDown className="w-6 h-6" /></Button>
        <span className="text-white/70">Đang phát</span>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><MoreHorizontal className="w-6 h-6" /></Button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl">
          <ImageWithFallback src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ✅ BƯỚC 4: THÊM THANH TIẾN TRÌNH VÀ ĐIỀU KHIỂN NHẠC */}
      <div className="px-8 pb-6">
        {/* Song Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-3xl font-bold truncate mb-2">{currentSong.title}</h1>
            <p className="text-white/70 text-lg">{currentSong.artistName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleToggleLike} className={`flex-shrink-0 transition-colors ${isLiked ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`}>
            <Heart className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <Button variant="ghost" size="icon" onClick={onPrevSong} className="text-white/80 hover:text-white scale-110"><SkipBack className="w-7 h-7" fill="currentColor" /></Button>
          <Button onClick={onTogglePlay} className="w-16 h-16 rounded-full bg-white text-black hover:scale-105 transition-transform">
            {isPlaying ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextSong} className="text-white/80 hover:text-white scale-110"><SkipForward className="w-7 h-7" fill="currentColor" /></Button>
        </div>
      </div>

      {/* Queue Section */}
      <div className="border-t border-white/10 bg-black/20 flex-shrink-0 overflow-hidden">
        <div className="p-6">
          <h3 className="text-white mb-4">Tiếp theo</h3>
          <div className="space-y-2 overflow-y-auto max-h-40">
            {isLoadingQueue ? <p className="text-white/60">Đang tải...</p> :
              upNextSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => onPlaySong(song, upNextSongs)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors ${song.id === currentSong.id ? "bg-white/10" : ""}`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0"><ImageWithFallback src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-white truncate">{song.title}</div>
                    <div className="text-white/60 text-sm truncate">{song.artistName}</div>
                  </div>
                  <div className="text-white/60 text-sm">{formatTime(song.duration)}</div>
                </button>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}