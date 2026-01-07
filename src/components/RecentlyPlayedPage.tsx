import { useState, useEffect } from 'react';
import { Play, History, Music4 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// ✅ BƯỚC 1: IMPORT API VÀ SONG TYPE
// Giả sử bạn sẽ tạo hàm getRecentlyPlayedSongs trong apiclient
import { getRecentlyPlayedSongs } from '../../api/apiclient'; 
import type { Song } from '../../api/apiclient'; 

// Hàm tiện ích để định dạng thời lượng
const formatDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Cập nhật props interface để khớp với App.tsx
interface RecentlyPlayedPageProps {
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
}

export function RecentlyPlayedPage({ onPlaySong }: RecentlyPlayedPageProps) {
  // ✅ BƯỚC 2: THÊM STATE ĐỂ QUẢN LÝ DỮ LIỆU TỪ API
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ BƯỚC 3: SỬ DỤNG useEffect ĐỂ GỌI API KHI COMPONENT ĐƯỢC TẢI
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Gọi API để lấy danh sách đã phát gần đây
        const response = await getRecentlyPlayedSongs(); 
        setSongs(response.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách đã phát gần đây:", err);
        setError("Không thể tải được lịch sử nghe nhạc. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

  // Hàm render nội dung chính dựa trên state
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-blue-200 mt-8">Đang tải lịch sử nghe nhạc...</p>;
    }

    if (error) {
      return <p className="text-center text-red-400 mt-8">{error}</p>;
    }

    if (songs.length === 0) {
      return (
        <div className="text-center text-blue-200 mt-8">
          <Music4 className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
          <h3 className="text-xl font-semibold text-white">Chưa có gì ở đây cả</h3>
          <p>Lịch sử nghe nhạc của bạn sẽ xuất hiện ở đây sau khi bạn phát một bài hát.</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {songs.map((song, index) => (
          <div 
            key={song.id}
            // ✅ BƯỚC 4: CẬP NHẬT onPlaySong VỚI CONTEXT LÀ DANH SÁCH 'songs'
            onClick={() => onPlaySong(song, songs)}
            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-8 text-center text-blue-300 group-hover:text-white">
              {index + 1}
            </div>
            
            <ImageWithFallback 
              src={song.coverUrl} 
              alt={song.title}
              className="w-12 h-12 rounded object-cover shadow-sm flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col justify-center">
                <span className="font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                  {song.title}
                </span>
                <span className="text-sm text-blue-300 truncate group-hover:text-white/70">
                  {song.artistName}
                </span>
              </div>
              <div className="hidden sm:flex items-center text-sm text-blue-300 truncate">
                {song.albumName}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-300 w-12 text-right">
                {formatDuration(song.duration)}
              </span>
              <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all">
                <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section (giữ nguyên) */}
      <div className="p-4 sm:p-8 bg-gradient-to-b from-orange-800/40 to-blue-900/20 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-500">
          <History className="w-16 h-16 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-200 mb-2">Thư viện</p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-white tracking-tight">
            Đã phát gần đây
          </h1>
          <p className="text-blue-200 max-w-lg">
            Những giai điệu bạn đã thưởng thức trong thời gian qua.
          </p>
        </div>
      </div>

      {/* Song List */}
      <div className="flex-1 px-4 sm:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}