import { Play, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SongCardProps {
  title: string;
  artist: string;
  cover: string;
  duration: string;
  isPlaying?: boolean;
  onPlay: () => void;
}

export function SongCard({ title, artist, cover, duration, isPlaying, onPlay }: SongCardProps) {
  return (
    <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all">
      <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-white truncate">{title}</div>
        <div className="text-white/60 text-sm truncate">{artist}</div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-white/60 text-sm">{duration}</span>
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-white hover:bg-white/20"
          onClick={onPlay}
        >
          <Play className="w-4 h-4 fill-white" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-white hover:bg-white/20"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
