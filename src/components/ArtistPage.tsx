import { Play, CheckCircle2, Heart, Share2, MoreHorizontal, Clock, Disc, Music, Users } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Song } from '../App';
import { useState } from 'react';

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  listeners: string;
  verified: boolean;
  description: string;
}

interface ArtistPageProps {
  artist: Artist;
  onPlaySong: (song: Song) => void;
  onBack: () => void;
}

export function ArtistPage({ artist, onPlaySong, onBack }: ArtistPageProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock Data for this specific artist
  const popularSongs: Song[] = [
    { id: 'as1', title: 'Greatest Hit', artist: artist.name, album: 'Best Of', duration: '3:45', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200' },
    { id: 'as2', title: 'Summer Vibes', artist: artist.name, album: 'Summer', duration: '2:50', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200' },
    { id: 'as3', title: 'Night Drive', artist: artist.name, album: 'Midnight', duration: '4:10', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200' },
    { id: 'as4', title: 'Acoustic Soul', artist: artist.name, album: 'Unplugged', duration: '3:20', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200' },
    { id: 'as5', title: 'Electric Dreams', artist: artist.name, album: 'Neon', duration: '3:55', cover: 'https://images.unsplash.com/photo-1459749411177-287ce3288789?auto=format&fit=crop&q=80&w=200' },
  ];

  const albums = [
    { id: 'al1', name: 'Midnight Memories', year: '2023', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300' },
    { id: 'al2', name: 'Neon Lights', year: '2022', cover: 'https://images.unsplash.com/photo-1621644820975-34407009f303?auto=format&fit=crop&q=80&w=300' },
    { id: 'al3', name: 'The Beginning', year: '2020', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?auto=format&fit=crop&q=80&w=300' },
    { id: 'al4', name: 'Live at Studio', year: '2019', cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=300' },
  ];

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-500 pb-10">
      {/* Hero Header */}
      <div className="relative h-[30vh] min-h-[250px] w-full group">
        <div className="absolute inset-0">
          <ImageWithFallback 
            src={artist.cover} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2 text-white/90">
            {artist.verified && (
              <span className="flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Verified Artist
              </span>
            )}
            <span className="text-sm font-medium">{artist.listeners} người nghe hàng tháng</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 drop-shadow-2xl">
            {artist.name}
          </h1>

          <div className="flex items-center gap-4">
            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg hover:scale-105 transition-transform"
              onClick={() => onPlaySong(popularSongs[0])}
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </Button>
            
            <Button 
              variant="outline" 
              className={`h-10 border-white/30 hover:bg-white/10 hover:border-white text-white rounded-full px-6 font-semibold uppercase tracking-wider text-xs transition-all ${isFollowing ? 'bg-transparent border-cyan-500 text-cyan-400' : ''}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        
        {/* Left Column: Popular & Albums */}
        <div className="space-y-10">
          {/* Popular Songs */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Phổ biến</h2>
            <div className="flex flex-col">
              {popularSongs.map((song, idx) => (
                <div 
                  key={song.id}
                  className="group grid grid-cols-[auto_1fr_auto] gap-4 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer items-center"
                  onClick={() => onPlaySong(song)}
                >
                  <div className="w-8 text-center text-white/50 text-sm font-variant-numeric">
                    <span className="group-hover:hidden">{idx + 1}</span>
                    <Play className="w-4 h-4 hidden group-hover:block mx-auto fill-current text-white" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden">
                      <ImageWithFallback src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{song.title}</div>
                      <div className="text-xs text-white/50">{song.listeners || '1.2M'} plays</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-white/50 text-sm">
                     <Heart className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-all" />
                     <span>{song.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs font-bold text-white/60 hover:text-white uppercase tracking-wider">Xem thêm</button>
          </section>

          {/* Albums */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Album</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div key={album.id} className="group cursor-pointer p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="aspect-square w-full rounded-md overflow-hidden mb-3 shadow-lg">
                    <ImageWithFallback src={album.cover} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-semibold text-white truncate">{album.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span>{album.year}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Disc className="w-3 h-3" /> Album</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: About / Bio */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Giới thiệu</h2>
            <div className="relative rounded-xl overflow-hidden aspect-square max-w-xs group">
              <ImageWithFallback src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                  <Users className="w-5 h-5" />
                  {artist.listeners} người nghe hàng tháng
                </div>
                <p className="text-white/80 line-clamp-4 group-hover:line-clamp-none transition-all duration-300 mb-4">
                  {artist.description}
                </p>
                <div className="flex gap-2">
                   <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><Share2 className="w-5 h-5" /></a>
                   <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><Music className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
