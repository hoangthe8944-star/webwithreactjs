import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Artist } from './ArtistPage';

// ✅ BƯỚC 1: IMPORT CÁC HÀM API VÀ TYPE
import type { Song } from '../../api/apiclient';
import { getTrendingSongs, getRecentlyPlayedSongs } from '../../api/apiclient';
import type { Playlist } from '../App';

// ✅ Đổi tên Type "Song" của giao diện để tránh trùng lặp với DTO
// interface SongUI {
//   id: string;
//   title: string;
//   artistName: string;
//   album: string;  
//   coverUrl: string;  
//   duration: string; 
//   streamUrl?: string; 
// }

interface HomePageProps {
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
  onArtistClick?: (artist: Artist) => void;

}

export function HomePage({ onPlaySong, onArtistClick }: HomePageProps) {

  // ✅ BƯỚC 2: TẠO STATE MỚI ĐỂ LƯU DỮ LIỆU TỪ API
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Chào buổi tối');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Chào buổi sáng');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Chào buổi chiều');
    } else {
      setGreeting('Chào buổi tối');
    }
  }, []);

  const featuredArtists: Artist[] = [
    {
      id: 'fa1',
      name: 'The Weeknd',
      avatar: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      cover: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      listeners: '102.5M',
      verified: true,
      description: 'The Weeknd là một ca sĩ, nhạc sĩ và nhà sản xuất thu âm người Canada. Được biết đến với sự linh hoạt trong âm nhạc và ca từ đen tối, anh là một nhân vật nổi bật trong âm nhạc đương đại.'
    },
    {
      id: 'fa2',
      name: 'Taylor Swift',
      avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpY3xlbnwxfHx8fDE3NjQ0MTc3Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpY3xlbnwxfHx8fDE3NjQ0MTc3Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      listeners: '98.3M',
      verified: true,
      description: 'Taylor Swift là một ca sĩ kiêm nhạc sĩ người Mỹ. Cô là một trong những nghệ sĩ bán đĩa nhạc chạy nhất thế giới và là nữ nghệ sĩ được nghe nhiều nhất trên Spotify.'
    },
    {
      id: 'fa3',
      name: 'BTS',
      avatar: 'https://images.unsplash.com/photo-1701506516420-3ef4b27413c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbmlnaHR8ZW58MXx8fHwxNzY0NDgzMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      cover: 'https://images.unsplash.com/photo-1701506516420-3ef4b27413c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbmlnaHR8ZW58MXx8fHwxNzY0NDgzMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      listeners: '45.2M',
      verified: true,
      description: 'BTS là một nhóm nhạc nam Hàn Quốc được thành lập vào năm 2010. Nhóm bao gồm 7 thành viên: RM, Jin, Suga, J-Hope, Jimin, V và Jungkook.'
    },
    {
      id: 'fa4',
      name: 'Son Tung MTP',
      avatar: 'https://images.unsplash.com/photo-1621644820975-34407009f303?auto=format&fit=crop&q=80&w=300',
      cover: 'https://images.unsplash.com/photo-1621644820975-34407009f303?auto=format&fit=crop&q=80&w=300',
      listeners: '5.5M',
      verified: true,
      description: 'Sơn Tùng M-TP là một nam ca sĩ kiêm sáng tác nhạc, rapper và diễn viên người Việt Nam.'
    },
    {
      id: 'fa5',
      name: 'Justin Bieber',
      avatar: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzY0NDEwODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      cover: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzY0NDEwODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      listeners: '80.1M',
      verified: true,
      description: 'Justin Bieber là một ca sĩ kiêm sáng tác nhạc người Canada. Bieber được phát hiện bởi nhà quản lý tài năng Scooter Braun thông qua các video trên YouTube.'
    }
  ];
  // --- DỮ LIỆU GIẢ CHO PLAYLIST ĐƯỢC GIỮ NGUYÊN ---
  const featuredPlaylists: Playlist[] = [
    { id: '1', name: 'Top Hits 2024', cover: '...', songCount: 50, description: '...' },
    { id: '2', name: 'Chill Vibes', cover: '...', songCount: 35, description: '...' },
    { id: '3', name: 'Rock Classics', cover: '...', songCount: 42, description: '...' },
    { id: '4', name: 'Jazz Evening', cover: '...', songCount: 28, description: '...' },
    { id: '5', name: 'Electronic Beats', cover: '...', songCount: 38, description: '...' },
    { id: '6', name: 'Night Concerts', cover: '...', songCount: 45, description: '...' },
  ];

  // ✅ BƯỚC 3: LOGIC GỌI API VÀ XỬ LÝ DỮ LIỆU
  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ BƯỚC 1: VẪN GỌI CẢ HAI API
        // Chúng ta dùng `Promise.allSettled` để một API lỗi không làm hỏng toàn bộ quá trình.
        const [recentResult, trendingResult] = await Promise.allSettled([
          getRecentlyPlayedSongs(),
          getTrendingSongs(18) // Lấy nhiều hơn một chút để dự phòng
        ]);

        let trendingSongs: Song[] = [];
        if (trendingResult.status === 'fulfilled') {
          trendingSongs = trendingResult.value.data;
        } else {
          // Nếu API trending cũng lỗi, ném ra lỗi để hiển thị thông báo
          console.error("Lỗi khi tải Trending Songs:", trendingResult.reason);
          throw new Error("Không thể tải danh sách bài hát đề xuất.");
        }

        // ✅ BƯỚC 2: XỬ LÝ LOGIC "FALLBACK" (DỰ PHÒNG)
        let recentSongs: Song[] = [];
        // Kiểm tra xem API "recent" có thành công và trả về dữ liệu không
        if (recentResult.status === 'fulfilled' && recentResult.value.data.length > 0) {
          // Kịch bản 1: Lấy thành công, dùng dữ liệu lịch sử
          recentSongs = recentResult.value.data.slice(0, 6);
        } else {
          // Kịch bản 2: Lỗi hoặc không có lịch sử -> Lấy ngẫu nhiên từ trending
          console.log("Không có lịch sử phát gần đây, lấy ngẫu nhiên từ trending.");
          recentSongs = trendingSongs.slice(0, 6); // Lấy 6 bài đầu của trending
        }

        // Cập nhật state
        setRecentlyPlayed(recentSongs);
        // Lấy 12 bài hát còn lại (hoặc toàn bộ nếu ít hơn) cho phần đề xuất
        setRecommendedSongs(trendingSongs.slice(6));

      } catch (err: any) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError(err.message || "Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  // Hàm tiện ích để định dạng thời gian
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render một section bài hát (để tránh lặp code)
  const renderSongSection = (title: string, songs: Song[], listContext: Song[]) => (
    <div>
      <h3 className="mb-4">{title}</h3>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 bg-white/5 rounded-lg p-2 animate-pulse">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded bg-white/10 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {songs.map((song) => (
            <button
              key={song.id}
              // ✅ BƯỚC 3: CUNG CẤP CONTEXT CHO HÀNG ĐỢI PHÁT
              onClick={() => onPlaySong(song, listContext)}
              className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-900/40 to-cyan-800/20 backdrop-blur rounded-lg p-2 hover:bg-blue-800/50 transition-all group"
            >
              <ImageWithFallback
                src={song.coverUrl}
                alt={song.title}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded shadow-lg flex-shrink-0"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="truncate text-sm sm:text-base">{song.title}</p>
                <p className="text-xs sm:text-sm text-blue-300 truncate">{song.artistName}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-cyan-500/30 flex-shrink-0">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ✅ BƯỚC 4: GIAO DIỆN JSX ĐƯỢC GIỮ NGUYÊN
  // Dữ liệu sẽ tự động được cập nhật khi API gọi xong
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="mb-2">Chào buổi tối</h2>
        <p className="text-blue-300">Khám phá âm nhạc yêu thích của bạn</p>
      </div>
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

      {/* Quick Access */}
      <div>
        {renderSongSection("Phát gần đây", recentlyPlayed, recentlyPlayed)}
        {/* {loading ? (
          <p className="text-blue-300">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recentlyPlayed.map((song) => (
              <button
                key={song.id}
                onClick={() => onPlaySong(song, recentlyPlayed)}
                className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-900/40 to-cyan-800/20 backdrop-blur rounded-lg p-2 hover:bg-blue-800/50 transition-all group"
              >
                <ImageWithFallback
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded shadow-lg flex-shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-sm sm:text-base">{song.title}</p>
                  <p className="text-xs sm:text-sm text-blue-300 truncate">{song.artistName}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-cyan-500/30 flex-shrink-0">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                </div>
              </button>
            ))}
          </div>
        )} */}
      </div>

      {/* Featured Artists Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Nghệ sĩ nổi bật</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {featuredArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onArtistClick?.(artist)}
              className="group flex flex-col items-center gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <ImageWithFallback src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{artist.name}</h4>
                <p className="text-xs text-blue-300 mt-1">Nghệ sĩ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Playlists (GIỮ NGUYÊN) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Playlist nổi bật</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {featuredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-gradient-to-b from-blue-900/30 to-transparent backdrop-blur rounded-lg p-3 sm:p-4 hover:bg-blue-800/40 transition-all cursor-pointer group"
            >
              <div className="relative mb-3 sm:mb-4">
                <ImageWithFallback
                  src={playlist.cover}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-lg shadow-xl"
                />
                <div className="absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg shadow-cyan-500/30">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="white" />
                </div>
              </div>
              <p className="mb-2 truncate text-sm sm:text-base">{playlist.name}</p>
              <p className="text-xs sm:text-sm text-blue-300 line-clamp-2">
                {playlist.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Songs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Đề xuất cho bạn</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">
            Xem thêm
          </button>
        </div>
        {loading ? (
          <p className="text-blue-300">Đang tải...</p>
        ) : (
          <div className="space-y-2">
            {recommendedSongs.map((song, index) => (
              <button
                key={song.id}
                onClick={() => onPlaySong(song, recommendedSongs)}
                className="w-full flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-blue-800/30 transition-all group"
              >
                <span className="text-blue-300 w-6 text-center text-sm sm:text-base">{index + 1}</span>
                <ImageWithFallback
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded shadow-lg flex-shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-sm sm:text-base">{song.title}</p>
                  <p className="text-xs sm:text-sm text-blue-300 truncate">{song.artistName}</p>
                </div>
                <p className="hidden md:block text-sm text-blue-300 truncate flex-shrink-0">{song.albumName}</p>
                <p className="text-xs sm:text-sm text-blue-300 w-12 sm:w-16 text-right flex-shrink-0">{song.duration}</p>
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