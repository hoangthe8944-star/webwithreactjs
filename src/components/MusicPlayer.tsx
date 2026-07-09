import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, Maximize2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
// Sử dụng 'Song' type được định nghĩa trong file API của bạn
import type { Song } from '../../api/apiclient';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Định nghĩa các props mà component này cần từ cha
interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onClickPlayer: () => void;
  onTimeUpdate: (time: number) => void;
  isPremium?: boolean;
  premiumStatus?: any;
  likedSongs?: Song[];
  onToggleLike?: (song: Song) => void;
  onFullScreen?: () => void;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  playbackRate: number;
  setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
}

// Hàm tiện ích để định dạng thời gian từ giây sang "phút:giây"
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  // padStart(2, '0') để đảm bảo luôn có 2 chữ số (vd: 0:05 thay vì 0:5)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function MusicPlayer({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onClickPlayer,
  onTimeUpdate,
  isPremium = false,
  premiumStatus = null,
  likedSongs = [],
  onToggleLike,
  onFullScreen,
  volume,
  setVolume,
  playbackRate,
  setPlaybackRate,
}: MusicPlayerProps) {

  // ✅ PHẦN 1: REFS VÀ STATE NỘI BỘ
  // -------------------------------------------------------------------
  // Ref để giữ đối tượng Video/Audio
  const audioRef = useRef<HTMLVideoElement | null>(null);

  // State chỉ dành cho giao diện của trình phát nhạc (UI-only state)
  const [progress, setProgress] = useState(0); // Tiến trình bài hát (tính bằng %)
  const [currentTime, setCurrentTime] = useState(0); // Thời gian hiện tại (giây)
  const [duration, setDuration] = useState(0);     // Tổng thời lượng (giây)
  const isLiked = currentSong && likedSongs ? likedSongs.some(s => s.id === currentSong.id) : false;
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const isAllowedToControl = isPremium;

  const isMini = isPremium && (
    premiumStatus?.packageId?.toString() === 'mini' ||
    premiumStatus?.packageId?.toString() === '1' ||
    premiumStatus?.packageName?.toLowerCase().includes('mini') ||
    premiumStatus?.premiumType?.toLowerCase().includes('mini')
  );

  const canSkip = () => {
    if (!isPremium) return false;
    if (isMini) {
      const today = new Date().toISOString().split('T')[0];
      const userId = localStorage.getItem('userId') || 'guest';
      const skipKey = `skips_${userId}_${today}`;
      const currentSkips = parseInt(localStorage.getItem(skipKey) || '0', 10);
      if (currentSkips >= 30) {
        return false;
      }
    }
    return true;
  };

  const registerSkip = () => {
    if (isMini) {
      const today = new Date().toISOString().split('T')[0];
      const userId = localStorage.getItem('userId') || 'guest';
      const skipKey = `skips_${userId}_${today}`;
      const currentSkips = parseInt(localStorage.getItem(skipKey) || '0', 10);
      localStorage.setItem(skipKey, (currentSkips + 1).toString());
      toast.info(`Bạn đã chuyển bài ${currentSkips + 1}/30 lần trong hôm nay (gói Premium Mini).`);
    }
  };

  const [isRepeatOneActive, setIsRepeatOneActive] = useState(false);
  const isRepeatOneActiveRef = useRef(isRepeatOneActive);

  const canUseSpeedup = isPremium && (
    premiumStatus?.packageId?.toString() === 'personal' ||
    premiumStatus?.packageId?.toString() === 'family' ||
    premiumStatus?.packageId?.toString() === '2' ||
    premiumStatus?.packageId?.toString() === '3' ||
    premiumStatus?.packageName?.toLowerCase().includes('cá nhân') ||
    premiumStatus?.packageName?.toLowerCase().includes('gia đình') ||
    premiumStatus?.premiumType?.toLowerCase().includes('cá nhân') ||
    premiumStatus?.premiumType?.toLowerCase().includes('gia đình')
  );

  const handleSpeedupClick = () => {
    if (!canUseSpeedup) {
      toast.error("Chức năng tăng tốc độ phát nhạc (Speedup) chỉ dành cho gói Premium Cá nhân hoặc Gia đình!");
      return;
    }
    let nextRate = 1.0;
    if (playbackRate === 1.0) nextRate = 1.25; // Nhanh vừa phải
    else if (playbackRate === 1.25) nextRate = 0.8;  // Chậm vừa phải
    else nextRate = 1.0; // Bình thường

    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    toast.success(`Tốc độ phát nhạc: ${nextRate}x`);
  };

  // Sync playbackRate on song change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [currentSong, playbackRate]);

  // Refs to hold the latest callbacks to avoid stale closures in useEffect event listeners
  const onNextSongRef = useRef(onNextSong);
  const onPrevSongRef = useRef(onPrevSong);
  const onTogglePlayRef = useRef(onTogglePlay);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep refs up-to-date and track portal target on every render
  useEffect(() => {
    onNextSongRef.current = onNextSong;
    onPrevSongRef.current = onPrevSong;
    onTogglePlayRef.current = onTogglePlay;
    onTimeUpdateRef.current = onTimeUpdate;
    isRepeatOneActiveRef.current = isRepeatOneActive;

    const target = document.getElementById('ad-video-container');
    if (target !== portalTarget) {
      setPortalTarget(target);
    }
  });

  const isMp4Ad = currentSong?.albumName === "Quảng cáo tài trợ" &&
    (currentSong?.streamUrl?.toLowerCase().endsWith('.mp4') || currentSong?.streamUrl?.toLowerCase().includes('.mp4'));

  // ✅ PHẦN 2: QUẢN LÝ LOGIC PHÁT NHẠC VỚI useEffect
  // -------------------------------------------------------------------

  // Hook này chạy mỗi khi `currentSong` thay đổi.
  // Nhiệm vụ: Tải và chuẩn bị bài hát mới.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Nếu không có bài hát nào được chọn, dọn dẹp và thoát
    if (!currentSong || !currentSong.streamUrl) {
      audio.pause();
      audio.src = "";
      return;
    }

    // Thiết lập source cho đối tượng media hiện tại
    audio.src = currentSong.streamUrl;
    audio.load();
    audio.volume = volume / 100;

    // --- Lắng nghe các sự kiện quan trọng từ đối tượng media ---

    // 1. Khi metadata (thời lượng) đã được tải
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.playbackRate = playbackRate;
    };

    // 2. Khi thời gian phát thay đổi -> Cập nhật UI
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      // Ensure audio.duration is a valid, non-zero number before calculating progress
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setProgress((time / audio.duration) * 100);
      } else {
        setProgress(0); // Default to 0 if duration is invalid
      }
      onTimeUpdateRef.current(time); // 🔥 BẮT BUỘC – GỬI LÊN APP
    };

    // 3. Khi bài hát kết thúc -> Gọi callback để tự động chuyển bài hoặc lặp lại
    const handleSongEnd = () => {
      if (isRepeatOneActiveRef.current && audioRef.current) {
        audioRef.current.currentTime = 0; // Tua về đầu bài
        audioRef.current.play(); // Phát lại
      } else {
        onNextSongRef.current(); // Chuyển bài như bình thường
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleSongEnd);

    // Nếu trạng thái chung là 'playing', bắt đầu phát nhạc ngay
    if (isPlaying) {
      audio.playbackRate = playbackRate;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Lỗi tự động phát nhạc:", error);
          onTogglePlayRef.current();
        });
      }
    }

    // Hàm dọn dẹp: Chạy khi component unmount hoặc khi `currentSong` thay đổi
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleSongEnd);
      audio.pause(); // Dừng bài hát cũ
    };
  }, [currentSong]); // Chỉ chạy lại hook này khi bài hát thay đổi

  // Hook này chạy mỗi khi trạng thái `isPlaying` từ cha thay đổi.
  // Nhiệm vụ: Đồng bộ hóa hành động play/pause.
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().catch(e => console.error("Lỗi khi phát nhạc:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, playbackRate]); // Chạy lại khi isPlaying hoặc tốc độ thay đổi


  // ✅ PHẦN 3: CÁC HÀM XỬ LÝ TƯƠNG TÁC NGƯỜI DÙNG
  // -------------------------------------------------------------------

  // Xử lý khi người dùng kéo thanh trượt thời lượng (tua nhạc)
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAllowedToControl) {
      toast.error("Tính năng tua nhạc chỉ dành cho gói Premium Cá nhân và Gia đình.");
      return;
    }
    if (audioRef.current && duration > 0) {
      const newProgress = Number(e.target.value);
      setProgress(newProgress);
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  // Xử lý khi người dùng kéo thanh trượt âm lượng
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Nếu không có bài hát nào, không hiển thị trình phát nhạc
  if (!currentSong) {
    return null;
  }

  const isAd = currentSong?.title.startsWith("[Quảng cáo]") || currentSong?.albumName === "Quảng cáo tài trợ";

  const videoElement = (
    <video
      ref={audioRef}
      className={isMp4Ad && portalTarget ? "w-full h-full object-cover rounded-3xl" : "hidden"}
      preload="auto"
      playsInline
    />
  );

  // ✅ PHẦN 4: KẾT NỐI LOGIC VÀO GIAO DIỆN (JSX)
  // -------------------------------------------------------------------
  return (
    <div className="dark fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-r from-blue-950/95 to-cyan-900/95 backdrop-blur-xl border-t border-blue-700/30 shadow-2xl z-50">
      {isMp4Ad && portalTarget ? (
        createPortal(videoElement, portalTarget)
      ) : (
        videoElement
      )}
      <div className="px-3 sm:px-6 py-3">
        {/* Main Player Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2">
          {/* Thông tin bài hát */}
          <button
            onClick={onClickPlayer}
            className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
          >
            <ImageWithFallback
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white truncate text-sm sm:text-base">{currentSong.title}</p>
              <p className="text-xs sm:text-sm text-blue-300 truncate">{currentSong.artistName}</p>
            </div>
          </button>

          {/* Các nút điều khiển chính */}
          <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
            <button
              onClick={() => setIsRepeatOneActive(prev => !prev)}
              className={`hidden sm:block transition-colors ${isRepeatOneActive ? 'text-cyan-400' : 'text-blue-300 hover:text-white'}`}
              disabled={isAd}
              title={isRepeatOneActive ? "Tắt lặp lại bài hát" : "Lặp lại bài hát hiện tại"}
            >
              <Repeat className={`w-4 h-4 ${isAd ? 'opacity-30' : ''}`} />
            </button>
            <button 
              onClick={() => {
                if (!isAllowedToControl) {
                  toast.error("Tính năng chuyển bài chỉ dành cho tài khoản Premium.");
                  return;
                }
                if (!canSkip()) {
                  toast.error("Gói Premium Mini của bạn đã hết lượt chuyển bài hôm nay (tối đa 30 lần/ngày)!");
                  return;
                }
                registerSkip();
                onPrevSong();
              }} 
              disabled={isAd}
              className={`hidden sm:block text-blue-200 hover:text-white transition-colors ${isAd ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''} ${!isAllowedToControl ? 'opacity-30 cursor-not-allowed' : ''}`}
              title="Bài trước"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={onTogglePlay}
              className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
              )}
            </button>
            <button 
              onClick={() => {
                if (!isAllowedToControl) {
                  toast.error("Tính năng chuyển bài chỉ dành cho tài khoản Premium.");
                  return;
                }
                if (!canSkip()) {
                  toast.error("Gói Premium Mini của bạn đã hết lượt chuyển bài hôm nay (tối đa 30 lần/ngày)!");
                  return;
                }
                registerSkip();
                onNextSong();
              }} 
              disabled={isAd}
              className={`hidden sm:block text-blue-200 hover:text-white transition-colors ${isAd ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''} ${!isAllowedToControl ? 'opacity-30 cursor-not-allowed' : ''}`}
              title="Bài tiếp theo"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="hidden sm:block text-blue-300 hover:text-white transition-colors" disabled={isAd} title="Lặp lại danh sách">
              <Repeat className={`w-4 h-4 ${isAd ? 'opacity-30' : ''}`} />
            </button>
            <button
              onClick={handleSpeedupClick}
              disabled={isAd}
              className={`hidden sm:block text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-blue-400/40 text-blue-300 hover:text-white hover:border-white transition-all ${isAd ? 'opacity-30 cursor-not-allowed' : ''}`}
              title="Thay đổi tốc độ phát"
            >
              {playbackRate}x
            </button>
            <button
              onClick={onFullScreen}
              className="hidden sm:block text-blue-300 hover:text-white transition-colors"
              title="Toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Các nút điều khiển phụ (âm lượng, yêu thích) */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => !isAd && currentSong && onToggleLike?.(currentSong)}
              disabled={isAd}
              className={`transition-colors ${isLiked ? 'text-cyan-400' : 'text-blue-300 hover:text-white'} ${isAd ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Heart className="w-5 h-5" fill={isLiked && !isAd ? 'currentColor' : 'none'} />
            </button>
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-300" />
              <input
                type="range" min="0" max="100" value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-blue-800/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-cyan-300"
              />
            </div>
          </div>
        </div>

        {/* Thanh tiến trình */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-blue-300 w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 relative group">
            <input
              type="range" min="0" max="100" value={progress}
              onChange={handleProgressChange}
              disabled={isAd}
              className={`w-full h-1 bg-blue-800/50 rounded-full appearance-none cursor-pointer group-hover:[&::-webkit-slider-thumb]:bg-cyan-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer ${isAd ? 'pointer-events-none opacity-50' : ''} ${!isAllowedToControl ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <span className="text-xs text-blue-300 w-8 sm:w-10">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}