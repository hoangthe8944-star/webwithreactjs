import { Play, Clock, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Song } from '../../api/apiclient';

interface LikedSongsPageProps {
  onPlaySong: (song: Song) => void;
}

export function LikedSongsPage({ onPlaySong }: LikedSongsPageProps) {
  // Mock data for liked songs
  const likedSongs: Song[] = [
    // {
    //   id: 'l1',
    //   title: 'Cruel Summer',
    //   artist: 'Taylor Swift',
    //   album: 'Lover',
    //   duration: '2:58',
    //   coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpY3xlbnwxfHx8fDE3NjQ0MTc3Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
    // {
    //   id: 'l2',
    //   title: 'Starboy',
    //   artist: 'The Weeknd ft. Daft Punk',
    //   album: 'Starboy',
    //   duration: '3:50',
    //   coverUrl: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
    // {
    //   id: 'l3',
    //   title: 'Flowers',
    //   artist: 'Miley Cyrus',
    //   album: 'Endless Summer Vacation',
    //   duration: '3:20',
    //   coverUrl: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzY0NDEwODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
    // {
    //   id: 'l4',
    //   title: 'Vampire',
    //   artist: 'Olivia Rodrigo',
    //   album: 'GUTS',
    //   duration: '3:39',
    //   coverUrl: 'https://images.unsplash.com/photo-1701506516420-3ef4b27413c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbmlnaHR8ZW58MXx8fHwxNzY0NDgzMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
    // {
    //   id: 'l5',
    //   title: 'Dance The Night',
    //   artist: 'Dua Lipa',
    //   album: 'Barbie The Album',
    //   duration: '2:56',
    //   coverUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwbXVzaWN8ZW58MXx8fHwxNzY0Mzc2NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
    // {
    //   id: 'l6',
    //   title: 'Die For You',
    //   artist: 'The Weeknd',
    //   album: 'Starboy',
    //   duration: '4:20',
    //   coverUrl: 'https://images.unsplash.com/photo-1604514288114-3851479df2f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZHxlbnwxfHx8fDE3NjQ0MTU0MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
    // {
    //   id: 'l7',
    //   title: 'Kill Bill',
    //   artist: 'SZA',
    //   album: 'SOS',
    //   duration: '2:33',
    //   coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpY3xlbnwxfHx8fDE3NjQ0MTc3Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    // },
  ];

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
          onClick={() => likedSongs.length > 0 && onPlaySong(likedSongs[0])}
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
                onClick={() => onPlaySong(song)}
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
