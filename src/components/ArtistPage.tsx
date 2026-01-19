import { Play, CheckCircle2, Heart, Share2, MoreHorizontal, Users, Disc, Music } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import type { Song } from '../../api/apiclient';

// ✅ IMPORT CÁC HÀM TỪ FILE API MỚI
import { getSongsByArtist, getAlbumsByArtist } from '../../api/artistApi';

export interface Artist {
  id: string;
  name: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  followerCount?: number;
  verified: boolean;
  bio?: string;

}

interface ArtistPageProps {
  artist: Artist;
  onPlaySong: (song: Song, context: Song[]) => void;
  onBack: () => void;
}

export function ArtistPage({ artist, onPlaySong, onBack }: ArtistPageProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  // ✅ STATE DỮ LIỆU THẬT
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFollowers = (count: number = 0) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  // ✅ GỌI API KHI TRANG LOAD
  // Trong ArtistPage.tsx

  useEffect(() => {
    console.log("useEffect chạy rồi");
    const loadArtistData = async () => {
      console.log("artistId =", artist.id);
      if (!artist.id) return;
      setIsLoading(true);
      try {
        const [songsRes, albumsRes] = await Promise.all([
          getSongsByArtist(artist.id),
          getAlbumsByArtist(artist.id)
        ]);
        console.log("SONGS RAW =", songsRes.data);
        console.log("ALBUMS RAW =", albumsRes.data);


        // ✅ KIỂM TRA NẾU LÀ MẢNG THÌ MỚI SET, NẾU KHÔNG THÌ ĐỂ MẢNG RỖNG
        setPopularSongs(Array.isArray(songsRes.data) ? songsRes.data : []);
        setAlbums(Array.isArray(albumsRes.data) ? albumsRes.data : []);

      } catch (err) {
        console.error("Không thể tải dữ liệu nghệ sĩ:", err);
        // ✅ NẾU LỖI (VÍ DỤ 404), ĐƯA VỀ MẢNG RỖNG ĐỂ KHÔNG BỊ VỠ GIAO DIỆN
        setPopularSongs([]);
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadArtistData();
  }, [artist.id]);
  const displayAvatar = artist.avatarUrl || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200";
  const displayCover = artist.coverImageUrl || displayAvatar;

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-500 pb-10">
      {/* Hero Header */}
      <div className="relative h-[30vh] min-h-[300px] w-full group">
        <div className="absolute inset-0">
          <ImageWithFallback src={displayCover} alt={artist.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2 text-white/90">
            {artist.verified && (
              <span className="flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Verified Artist
              </span>
            )}
            <span className="text-sm font-medium">{formatFollowers(artist.followerCount)} người nghe hàng tháng</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 drop-shadow-2xl">{artist.name}</h1>
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg"
              onClick={() => popularSongs.length > 0 && onPlaySong(popularSongs[0], popularSongs)}
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </Button>
            <Button variant="outline" className={`h-10 border-white/30 text-white rounded-full px-6 font-semibold transition-all ${isFollowing ? 'border-cyan-500 text-cyan-400' : ''}`} onClick={() => setIsFollowing(!isFollowing)}>
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white rounded-full">
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Phổ biến</h2>
            <div className="flex flex-col">
              {(Array.isArray(popularSongs) ? popularSongs : []).slice(0, 5).map((song, idx) => (
                <div key={song.id} className="group grid grid-cols-[auto_1fr_auto] gap-4 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer items-center" onClick={() => onPlaySong(song, popularSongs)}>
                  <div className="w-8 text-center text-white/50 text-sm"><span className="group-hover:hidden">{idx + 1}</span><Play className="w-4 h-4 hidden group-hover:block mx-auto fill-current text-white" /></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden"><ImageWithFallback src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" /></div>
                    <div>
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{song.title}</div>
                      <div className="text-xs text-white/50">{song.viewCount?.toLocaleString()} plays</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/50 text-sm">
                    <Heart className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-all" />
                    <span>{formatDuration(song.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Album</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div key={album.id} className="group cursor-pointer p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="aspect-square w-full rounded-md overflow-hidden mb-3 shadow-lg">
                    <ImageWithFallback src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-semibold text-white truncate">{album.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span>{new Date(album.releaseDate).getFullYear()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Disc className="w-3 h-3" /> Album</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Giới thiệu</h2>
            <div className="relative rounded-xl overflow-hidden aspect-square max-w-xs group shadow-2xl">
              <ImageWithFallback src={displayAvatar} alt={artist.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2"><Users className="w-5 h-5" />{formatFollowers(artist.followerCount)} người nghe</div>
                <p className="text-white/80 text-sm line-clamp-4 group-hover:line-clamp-none transition-all duration-500 mb-4 bg-black/20 backdrop-blur-sm rounded p-2">
                  {artist.bio || "Chưa có tiểu sử cho nghệ sĩ này."}
                </p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><Share2 className="w-5 h-5" /></button>
                  <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><Music className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}