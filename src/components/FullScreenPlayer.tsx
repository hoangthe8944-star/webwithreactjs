import { Heart, Play, Pause, SkipBack, SkipForward, Minimize2, Music2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Song } from '../../api/apiclient';

const ImageWithFallback = ({ src, className }: { src: string; className?: string }) => {
  const [error, setError] = useState(false);
  if (error || !src) return <div className={`${className} flex items-center justify-center bg-white/5`}><Music2 className="w-1/2 h-1/2 text-white/20" /></div>;
  return <img src={src} className={className} onError={() => setError(true)} />;
};

interface FullScreenPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  isPremium?: boolean;
  premiumStatus?: any;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onClose: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (r: number) => void;
  currentTime: number; // New prop
  duration: number;    // New prop
  progress: number;    // New prop
  onProgressChange: (progress: number) => void; // New prop
}

// Hàm tiện ích để định dạng thời gian từ giây sang "phút:giây"
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function FullScreenPlayer({
  currentSong,
  isPlaying,
  isPremium = false,
  premiumStatus = null,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onClose,
  volume,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  currentTime, // Destructure new prop
  duration,    // Destructure new prop
  progress,    // Destructure new prop
  onProgressChange, // Destructure new prop
}: FullScreenPlayerProps) {
  const [liked, setLiked] = useState(false);
  const [lyrics, setLyrics] = useState<string[]>([]);

  const canViewLyrics = isPremium && (
    premiumStatus?.packageId?.toString() === 'personal' ||
    premiumStatus?.packageId?.toString() === 'family' ||
    premiumStatus?.packageId?.toString() === '2' ||
    premiumStatus?.packageId?.toString() === '3' ||
    premiumStatus?.packageName?.toLowerCase().includes('cá nhân') ||
    premiumStatus?.packageName?.toLowerCase().includes('gia đình') ||
    premiumStatus?.premiumType?.toLowerCase().includes('cá nhân') ||
    premiumStatus?.premiumType?.toLowerCase().includes('gia đình')
  );

  useEffect(() => {
    if (!canViewLyrics) {
      setLyrics(["Tính năng xem lời bài hát chỉ dành cho gói Premium Cá nhân hoặc Gia đình."]);
      return;
    }
    const fetchLyrics = async () => {
      try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(currentSong.artistName)}/${encodeURIComponent(currentSong.title)}`);
        const data = await response.json();
        if (data.lyrics) {
          setLyrics(data.lyrics.split('\n').filter((line: string) => line.trim() !== ''));
        } else {
          setLyrics(["Không tìm thấy lời bài hát."]);
        }
      } catch (e) {
        setLyrics(["Không thể tải lời bài hát."]);
      }
    };
    fetchLyrics();
  }, [currentSong, canViewLyrics]);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col md:flex-row items-center justify-center overflow-hidden text-white">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-105"
        style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-black/40" /> {/* Lighter Overlay for readability */}

      {/* LEFT: COVER ART & CONTROLS */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-2">
        <div className="w-40 h-40 md:w-56 md:h-56 mb-2 relative shadow-2xl rounded-lg overflow-hidden">
          <ImageWithFallback src={currentSong.coverUrl} className="w-full h-full object-cover" />
        </div>

        <h2 className="text-lg md:text-2xl font-bold mb-0.5 text-center">{currentSong.title}</h2>
        <p className="text-white/60 text-xs md:text-sm mb-3">{currentSong.artistName}</p>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setLiked(!liked)} className="p-1">
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${liked ? 'text-red-500' : 'text-white/60'}`} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onPrevSong} className="p-1"><SkipBack size={18} className="md:w-5 md:h-5" /></button>
          <button onClick={onTogglePlay} className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            {isPlaying ? <Pause size={24} className="md:w-6 md:h-6" /> : <Play size={24} className="md:w-6 md:h-6" />}
          </button>
          <button onClick={onNextSong} className="p-1"><SkipForward size={18} className="md:w-5 md:h-5" /></button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs flex items-center gap-2 mt-3">
          <span className="text-xs text-white/60">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-gray-200"
          />
          <span className="text-xs text-white/60">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT: LYRICS */}
      <div className="relative z-10 w-full md:w-1/2 h-full flex flex-col p-8 md:p-16 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8">Lời bài hát</h3>
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          {lyrics.map((line, index) => (
            <p key={index} className="text-2xl md:text-3xl font-medium text-white/80 mb-6 hover:text-white transition-colors">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <button onClick={onClose} className="absolute top-8 right-8 z-20 text-white/40 hover:text-white transition-colors">
        <Minimize2 size={32} />
      </button>
    </div>
  );
}