import { Play } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PlaylistCardProps {
  title: string;
  description: string;
  cover: string;
  onPlay: () => void;
}

export function PlaylistCard({ title, description, cover, onPlay }: PlaylistCardProps) {
  return (
    <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-gradient-to-b hover:from-white/15 hover:to-white/10 transition-all cursor-pointer border border-white/5">
      <div className="aspect-square rounded-md overflow-hidden mb-4 relative">
        <ImageWithFallback
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl"
          onClick={onPlay}
        >
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </Button>
      </div>
      <h3 className="text-white mb-1 truncate">{title}</h3>
      <p className="text-white/60 text-sm line-clamp-2">{description}</p>
    </div>
  );
}