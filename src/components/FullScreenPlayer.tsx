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
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onClose: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (r: number) => void;
}

export function FullScreenPlayer({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onClose,
  volume,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange
}: FullScreenPlayerProps) {
  const [liked, setLiked] = useState(false);
  const [lyrics, setLyrics] = useState<string[]>([]);

  useEffect(() => {
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
  }, [currentSong]);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col md:flex-row items-center justify-center overflow-hidden text-white">
      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-purple-900" />

      {/* LEFT: COVER ART & CONTROLS */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-72 h-72 md:w-96 md:h-96 mb-8 relative shadow-2xl rounded-2xl overflow-hidden">
          <ImageWithFallback src={currentSong.coverUrl} className="w-full h-full object-cover" />
        </div>

        <h2 className="text-4xl font-bold mb-2 text-center">{currentSong.title}</h2>
        <p className="text-white/60 text-xl mb-8">{currentSong.artistName}</p>

        <div className="flex items-center gap-8">
          <button onClick={() => setLiked(!liked)}>
            <Heart className={`w-8 h-8 ${liked ? 'text-red-500' : 'text-white/60'}`} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onPrevSong}><SkipBack size={32} /></button>
          <button onClick={onTogglePlay} className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            {isPlaying ? <Pause size={40} /> : <Play size={40} />}
          </button>
          <button onClick={onNextSong}><SkipForward size={32} /></button>
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