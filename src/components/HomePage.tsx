import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Artist } from './ArtistPage';

// ✅ IMPORT ĐÚNG CÁC API NHƯ TRONG PLAYLISTSPAGE
import type { Song, HistoryItem } from '../../api/apiclient';
import { getTrendingSongs, getUserHistory } from '../../api/apiclient';
import { getPublicPlaylists } from '../../api/playlistApi';
import { getAllArtists } from '../../api/artistApi';
import PlaylistCover from './PlaylistCover';

interface HomePageProps {
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
  onArtistClick?: (artist: Artist) => void;
  onPlaylistClick?: (playlist: any) => void;
}

export function HomePage({ onPlaySong, onArtistClick, onPlaylistClick }: HomePageProps) {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<any[]>([]); // Lưu danh sách playlist

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Chào buổi tối');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Chào buổi sáng');
    else if (hour >= 12 && hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  // ✅ HÀM HELPER ĐỂ XỬ LÝ ẢNH (Dùng logic giống PlaylistCover để tránh 404)
  const formatPlaylistImage = (image: string | null) => {
    if (!image || image === "null" || image.trim() === "") return null;
    if (image.startsWith('http')) return image;
    return `https://i.scdn.co/image/ab67616d0000b273${image}`;
  };

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem('userId');

        // ✅ GỌI API SONG SONG GIỐNG PLAYLISTSPAGE
        const [recentResult, trendingResult, artistResult, playlistResult] = await Promise.allSettled([
          userId ? getUserHistory(userId) : Promise.reject("No User ID"),
          getTrendingSongs(18),
          getAllArtists(),
          getPublicPlaylists()
        ]);

        // 1. Xử lý Trending & Recommended
        let trendingSongs: Song[] = [];
        if (trendingResult.status === 'fulfilled') {
          trendingSongs = (trendingResult.value as any).data || trendingResult.value;
        }

        // 2. Xử lý Recently Played
        if (recentResult.status === 'fulfilled') {
          const recentData = (recentResult.value as any).data || recentResult.value;
          const extractedSongs = recentData
            .map((item: HistoryItem) => item.songDetails)
            .filter((s: any) => s !== null);
          setRecentlyPlayed(extractedSongs.slice(0, 6));
        } else {
          setRecentlyPlayed(trendingSongs.slice(0, 6));
        }

        // 3. Xử lý Artists
        if (artistResult.status === 'fulfilled') {
          const artistData = (artistResult.value as any).data || artistResult.value;
          const mappedArtists = artistData.map((a: any) => ({
            ...a,
            avatar: a.avatarUrl || a.avatar,
            verified: a.verified || false,
            listeners: a.followerCount ? `${(a.followerCount / 1000000).toFixed(1)}M` : '0M'
          }));
          setFeaturedArtists(mappedArtists.slice(0, 5));
        }

        // 4. ✅ XỬ LÝ PLAYLIST GIỐNG LOGIC CỦA PLAYLISTSPAGE
        if (playlistResult.status === 'fulfilled') {
          const playlistData = (playlistResult.value as any).data || playlistResult.value;

          if (Array.isArray(playlistData)) {
            const mappedPlaylists = playlistData.map((p: any) => ({
              ...p, // Giữ nguyên các trường như songDetails, publicPlaylist giống PlaylistDto
              id: p.id,
              name: p.name,
              // Xử lý cover để ImageWithFallback không bị lỗi 404
              cover: formatPlaylistImage(p.coverImage || p.cover),
              description: p.description || 'Playlist dành cho bạn'
            }));
            setFeaturedPlaylists(mappedPlaylists.slice(0, 6));
          }
        }

        setRecommendedSongs(trendingSongs.slice(6));

      } catch (err: any) {
        console.error("Lỗi trang chủ:", err);
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongSection = (title: string, songs: Song[], listContext: Song[]) => (
    <div>
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {songs.map((song) => (
          <button
            key={song.id}
            onClick={() => onPlaySong(song, listContext)}
            className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-900/40 to-cyan-800/20 backdrop-blur rounded-lg p-2 hover:bg-blue-800/50 transition-all group"
          >
            <ImageWithFallback src={song.coverUrl} alt={song.title} className="w-14 h-14 sm:w-16 sm:h-16 rounded shadow-lg flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-sm sm:text-base font-medium">{song.title}</p>
              <p className="text-xs sm:text-sm text-blue-300 truncate">{song.artistName}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-cyan-500/30 flex-shrink-0">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ✅ GIAO DIỆN JSX GIỮ NGUYÊN 100%
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      <div>
        <h2 className="mb-2 text-3xl font-bold">{greeting}</h2>
        <p className="text-blue-300">Khám phá âm nhạc yêu thích của bạn</p>
      </div>

      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

      {!loading && recentlyPlayed.length > 0 && renderSongSection("Phát gần đây", recentlyPlayed, recentlyPlayed)}

      {/* Featured Artists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Nghệ sĩ nổi bật</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {featuredArtists.map((artist) => (
            <div key={artist.id} onClick={() => onArtistClick?.(artist)} className="group flex flex-col items-center gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/5 transition-all">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <ImageWithFallback src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{artist.name}</h4>
                <p className="text-xs text-blue-300 mt-1">Nghệ sĩ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Playlists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Playlist nổi bật</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {featuredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onPlaylistClick?.(playlist)}
              className="bg-gradient-to-b from-blue-900/30 to-transparent backdrop-blur rounded-lg p-3 sm:p-4 hover:bg-blue-800/40 transition-all cursor-pointer group"
            >
              <div className="relative mb-3 sm:mb-4">
                {/* ✅ THAY THẾ Ở ĐÂY: Dùng PlaylistCover thay cho ImageWithFallback */}
                <div className="aspect-square w-full">
                  <PlaylistCover
                    coverImage={playlist.coverImage}
                    tracks={playlist.songDetails || []}
                    name={playlist.name}
                    className="w-full h-full"
                  />
                </div>

                <div className="absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg shadow-cyan-500/30">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="white" />
                </div>
              </div>
              <p className="mb-2 truncate text-sm sm:text-base font-semibold">{playlist.name}</p>
              <p className="text-xs sm:text-sm text-blue-300 line-clamp-2">
                {playlist.description || "Playlist dành cho bạn"}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Recommended Songs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Đề xuất cho bạn</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">Xem thêm</button>
        </div>
        {!loading && (
          <div className="space-y-2">
            {recommendedSongs.map((song, index) => (
              <button key={song.id} onClick={() => onPlaySong(song, recommendedSongs)} className="w-full flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-blue-800/30 transition-all group">
                <span className="text-blue-300 w-6 text-center text-sm sm:text-base">{index + 1}</span>
                <ImageWithFallback src={song.coverUrl} alt={song.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded shadow-lg flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-sm sm:text-base font-medium">{song.title}</p>
                  <p className="text-xs sm:text-sm text-blue-300 truncate">{song.artistName}</p>
                </div>
                <p className="hidden md:block text-sm text-blue-300 truncate flex-shrink-0">{song.albumName}</p>
                <p className="text-xs sm:text-sm text-blue-300 w-12 sm:w-16 text-right flex-shrink-0">{formatDuration(song.duration)}</p>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="white" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}