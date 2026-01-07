import { ChevronLeft, Play, Clock, MoreHorizontal, Shuffle, Heart, Download } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Playlist } from '../App';
import { useState } from 'react';
import type { Song } from '../../api/apiclient';
import PlaylistCover from './PlaylistCover'; // Sử dụng lại Component Grid đã viết

interface PlaylistDetailPageProps {
  // Playlist bây giờ nên chứa danh sách các bài hát (Song[]) đã được lấy từ API
  playlist: Playlist & { 
    owner?: string; 
    description?: string; 
    updatedAt?: string;
    songs?: Song[]; // Danh sách bài hát thực tế
  };
  onBack: () => void;
  onPlaySong: (song: Song) => void;
}

export function PlaylistDetailPage({ playlist, onBack, onPlaySong }: PlaylistDetailPageProps) {
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);

  // Lấy danh sách bài hát từ playlist truyền vào, nếu không có thì để mảng rỗng
  const songs = playlist.songs || [];

  // Hàm helper định dạng thời gian (giây -> mm:ss)
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-500 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-cyan-900/40 to-black/20 p-6 lg:p-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-white/70 hover:text-white hover:bg-white/10 -ml-2"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
          <div className="w-48 h-48 md:w-56 md:h-56 shadow-2xl shadow-black/50 rounded-lg overflow-hidden flex-shrink-0">
             {/* Dùng PlaylistCover để tự động hiện Grid nếu không có ảnh bìa */}
             <PlaylistCover 
                coverImage={playlist.cover} 
                tracks={songs} 
                name={playlist.name}
             />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <span className="text-sm font-medium uppercase tracking-wider text-white/80">Playlist</span>
            <h1 className="text-4xl md:text-6xl font-black">{playlist.name}</h1>
            <p className="text-white/70 text-lg line-clamp-2">{playlist.description || 'Không có mô tả'}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
              <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-black font-bold">
                {playlist.owner ? playlist.owner.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{playlist.owner || 'Người dùng'}</span>
              <span>•</span>
              <span>{songs.length} bài hát</span>
              <span>•</span>
              <span className="text-white/60">
                {playlist.updatedAt ? new Date(playlist.updatedAt).toLocaleDateString() : 'Gần đây'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 lg:px-8 py-6 flex items-center gap-4">
        <Button 
          size="icon" 
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105"
          onClick={() => songs.length > 0 && onPlaySong(songs[0])}
        >
          <Play className="w-6 h-6 fill-current ml-1" />
        </Button>
        
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
          <Heart className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* Songs List */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5">
          <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1fr_auto] gap-4 p-4 text-sm text-white/50 border-b border-white/5 uppercase tracking-wider font-medium">
            <div className="w-8 text-center">#</div>
            <div>Tiêu đề</div>
            <div className="hidden md:block">Album</div>
            <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
          </div>

          <div className="divide-y divide-white/5">
            {songs.length > 0 ? (
              songs.map((song, index) => (
                <div 
                  key={song.id}
                  onMouseEnter={() => setHoveredSong(song.id)}
                  onMouseLeave={() => setHoveredSong(null)}
                  onClick={() => onPlaySong(song)}
                  className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1fr_auto] gap-4 p-3 items-center hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-8 text-center flex justify-center text-white/70 group-hover:text-white">
                    {hoveredSong === song.id ? (
                      <Play className="w-4 h-4 fill-current text-cyan-400" />
                    ) : (
                      <span className="font-variant-numeric tabular-nums">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-medium truncate ${hoveredSong === song.id ? 'text-cyan-400' : 'text-white'}`}>
                        {song.title}
                      </div>
                      <div className="text-sm text-white/60 truncate group-hover:text-white/80">
                        {song.artistName}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block text-sm text-white/60 truncate group-hover:text-white/80">
                    {song.albumName}
                  </div>

                  <div className="flex items-center justify-end gap-4 text-sm text-white/60 font-variant-numeric tabular-nums">
                    <button className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-all">
                      <Heart className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-right group-hover:text-white">
                        {formatTime(song.duration)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-white/40 italic">
                Playlist này chưa có bài hát nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}