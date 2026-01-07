import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { searchPublicSongs } from '../../api/apiclient';
import type { Song } from '../../api/apiclient';

// Định nghĩa Type Song cho Giao diện
// export interface Song {
//   id: string;
//   title: string;
//   artist: string;
//   album: string;
//   cover: string;
//   duration: string;
//   streamUrl?: string;
// }

interface SearchPageProps {
  searchQuery: string;
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
}

export function SearchPage({ searchQuery, onPlaySong }: SearchPageProps) {
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  // Dữ liệu giả cho Categories
  const categories = [
    { name: 'Pop', color: 'from-pink-500 to-rose-500', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300' },
    { name: 'Rock', color: 'from-red-500 to-orange-600', cover: 'https://images.unsplash.com/photo-1604514288114-3851479df2f2?auto=format&fit=crop&q=80&w=300' },
    { name: 'Jazz', color: 'from-amber-500 to-yellow-500', cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80&w=300' },
    { name: 'Electronic', color: 'from-cyan-500 to-blue-500', cover: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?auto=format&fit=crop&q=80&w=300' },
    { name: 'Hip Hop', color: 'from-purple-500 to-pink-500', cover: 'https://images.unsplash.com/photo-1701506516420-3ef4b27413c9?auto=format&fit=crop&q=80&w=300' },
    { name: 'Classical', color: 'from-indigo-500 to-purple-500', cover: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?auto=format&fit=crop&q=80&w=300' },
    { name: 'Country', color: 'from-orange-500 to-red-500', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300' },
    { name: 'R&B', color: 'from-emerald-500 to-teal-500', cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80&w=300' },
  ];

  // --- LOGIC CALL API ---
  useEffect(() => {
    const fetchSongs = async () => {
      // Nếu không có query, dọn dẹp kết quả và dừng lại
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);

      try {
        const response = await searchPublicSongs(searchQuery);
        // ✅ BƯỚC 3: KHÔNG CẦN MAP DỮ LIỆU NỮA, SỬ DỤNG TRỰC TIẾP
        // API đã trả về đúng kiểu 'Song[]' mà chúng ta cần
        const songsFromApi = Array.isArray(response.data) ? response.data : [];
        setResults(songsFromApi);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: Chờ 300ms sau khi người dùng ngừng gõ mới gọi API
    const timeoutId = setTimeout(() => fetchSongs(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Hàm tiện ích định dạng thời gian
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  // Kiểm tra xem có phải là kết quả của một nghệ sĩ duy nhất không
  const isSingleArtistResult = results.length > 0 && results.every(song => song.artistName === results[0].artistName);

  return (
    <div className="px-8 py-6 space-y-8">
      {searchQuery ? (
        /* Search Results */
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-white text-2xl font-bold">Kết quả tìm kiếm cho "{searchQuery}"</h2>
            {loading && <span className="text-cyan-400 animate-pulse text-sm">Đang tìm...</span>}
          </div>

          {results.length > 0 ? (
            <>
              {/* Top Result */}
              <div className="mb-8">
                <h3 className="mb-4 text-blue-300 font-semibold uppercase tracking-wider text-sm">Kết quả hàng đầu</h3>
                <button
                  onClick={() => onPlaySong(results[0], results)}
                  className="bg-gradient-to-br from-blue-900/60 to-cyan-800/40 backdrop-blur rounded-lg p-6 hover:from-blue-800/70 hover:to-cyan-700/50 transition-all group max-w-md w-full text-left border border-white/5 hover:border-cyan-500/30"
                >
                  <ImageWithFallback
                    src={results[0].coverUrl}
                    alt={results[0].title}
                    className="w-32 h-32 rounded-lg shadow-2xl mb-4 object-cover"
                  />
                  <h3 className="mb-2 group-hover:text-cyan-300 transition-colors font-bold text-2xl text-white">
                    {results[0].title}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-300">
                    <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-medium">Bài hát</span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/90">{results[0].artistName}</span>
                  </div>
                </button>
              </div>

              {/* Songs Results List */}
              <div>
                {/* ✅ Tiêu đề thông minh */}
                <h3 className="mb-4 text-blue-300 font-semibold uppercase tracking-wider text-sm">
                  {isSingleArtistResult ? `Bài hát của ${results[0].artistName}` : 'Bài hát'}
                </h3>
                <div className="space-y-2">
                  {results.map((song, index) => (
                    <button
                      key={song.id}
                      onClick={() => onPlaySong(song, results)}
                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all group border border-transparent hover:border-white/5"
                    >
                      <span className="text-blue-300 w-6 text-center font-mono">{index + 1}</span>
                      <ImageWithFallback
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded shadow-lg object-cover"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="truncate text-white group-hover:text-cyan-400 transition-colors font-medium text-lg">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-400 truncate group-hover:text-gray-300">{song.artistName}</p>
                      </div>
                      <p className="text-sm text-gray-400 hidden md:block truncate max-w-[200px]">
                        {song.albumName}
                      </p>
                      <p className="text-sm text-gray-400 w-16 text-right font-mono">{formatDuration(song.duration)}</p>
                      <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg shadow-cyan-500/50">
                        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            !loading && (
              <div className="text-gray-400 flex flex-col items-center justify-center py-20">
                <p className="text-xl">Không tìm thấy bài hát nào khớp với từ khóa.</p>
                <p className="text-sm mt-2 text-gray-600">Hãy thử tìm tên bài hát hoặc nghệ sĩ khác xem sao.</p>
              </div>
            )
          )}
        </div>
      ) : (
        /* Browse Categories (Giữ nguyên) */
        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">Duyệt tất cả</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                className="relative overflow-hidden rounded-lg aspect-square hover:scale-105 transition-transform group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <ImageWithFallback
                  src={category.cover}
                  alt={category.name}
                  className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:opacity-40 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white drop-shadow-lg font-bold text-2xl tracking-tight">{category.name}</h3>
                </div>
              </button>
            ))}
          </div>

          {/* Trending Searches */}
          <div className="mt-12">
            <h3 className="mb-4 text-blue-300 uppercase tracking-wider text-sm font-semibold">Tìm kiếm thịnh hành</h3>
            <div className="flex flex-wrap gap-3">
              {['Son Tung MTP', 'Mono', 'HIEUTHUHAI', 'Jazz', 'Rock', 'Chill', 'Workout'].map(
                (tag) => (
                  <button
                    key={tag}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 text-sm text-gray-300 hover:text-white"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}