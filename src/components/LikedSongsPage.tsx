import { Play, Clock, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Song } from '../../api/apiclient';

interface LikedSongsPageProps {
  likedSongs: Song[];
  onPlaySong: (song: Song, context: Song[]) => void;
}

export function LikedSongsPage({ likedSongs, onPlaySong }: LikedSongsPageProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="p-4 sm:p-8 bg-gradient-to-b from-purple-800/50 to-blue-900/20 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
        <div className="w-40 h-40 sm:w-52 sm:h-52 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-16 h-16 sm:w-24 sm:h-24 text-white" fill="white" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-200 mb-2">Playlist</p>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white tracking-tight">
            Bài hát yêu thích
          </h1>
          <div className="flex items-center gap-2 text-sm sm:text-base text-blue-200 justify-center sm:justify-start">
            <span className="font-semibold text-white">MusicStream User</span>
            <span>•</span>
            <span>{likedSongs.length} bài hát</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 sm:px-8 py-6 flex items-center gap-4 bg-gradient-to-b from-blue-900/20 to-transparent">
        <button 
          onClick={() => likedSongs.length > 0 && onPlaySong(likedSongs[0], likedSongs)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-cyan-500/30"
        >
          <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1" fill="currentColor" />
        </button>
      </div>

      {/* Song List */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        <div className="bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-white/10 text-sm text-blue-300 uppercase tracking-wider font-medium sticky top-0 bg-blue-900/90 backdrop-blur z-10">
            <div className="w-8 text-center">#</div>
            <div>Tiêu đề</div>
            <div className="hidden sm:block">Album</div>
            <div className="pr-4"><Clock className="w-4 h-4 ml-auto" /></div>
          </div>

          {/* Songs */}
          <div className="divide-y divide-white/5">
            {likedSongs.map((song, index) => (
              <div 
                key={song.id}
                onClick={() => onPlaySong(song, likedSongs)}
                className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 hover:bg-white/10 transition-colors group cursor-pointer items-center"
              >
                <div className="w-8 text-center text-blue-300 group-hover:text-white flex justify-center">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <Play className="w-4 h-4 hidden group-hover:block text-white" fill="white" />
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <ImageWithFallback 
                    src={song.coverUrl} 
                    alt={song.title}
                    className="w-10 h-10 rounded shadow-md object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                      {song.title}
                    </span>
                    <span className="text-sm text-blue-300 truncate group-hover:text-white/70">
                      {song.artistName}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-sm text-blue-300 truncate">
                  <span className="group-hover:text-white/70 truncate">{song.albumName}</span>
                </div>

                <div className="text-sm text-blue-300 flex items-center justify-end pr-2 group-hover:text-white/70">
                  {song.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
