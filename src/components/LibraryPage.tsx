import { Music, Heart, Clock, ListMusic, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Song } from '../../api/apiclient';
import { useEffect, useState } from 'react';
import followEndpoint from '../../api/followapi';
import { getCurrentUser } from '../../api/authapi';

interface LibraryPageProps {
  likedSongs: Song[];
  onPlaySong: (song: Song, context: Song[]) => void;
  onNavigate: (page: string) => void;
}

export function LibraryPage({
  likedSongs,
  onPlaySong,
  onNavigate,
}: LibraryPageProps) {

  const currentUser = getCurrentUser();
  const userId = currentUser?.id ?? "";

  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!userId) return;

      try {
        const res = await followEndpoint.getFollowing(userId, "ARTIST");
        setFollowingCount(res.data.length);
      } catch (err) {
        console.error("Không thể tải danh sách follow", err);
      }
    };

    loadFollowing();
  }, [userId]);

  const categories = [
    {
      name: 'Bài hát yêu thích',
      icon: Heart,
      count: likedSongs.length,
      color: 'from-pink-500 to-rose-600',
      page: 'liked-songs',
    },
    {
      name: 'Playlists',
      icon: ListMusic,
      count: 0,
      color: 'from-cyan-500 to-blue-600',
      page: 'library',
    },
    {
      name: 'Đang theo dõi',
      icon: Users,
      count: followingCount,
      color: 'from-purple-500 to-blue-600',
      page: 'following-artists',
    },
    {
      name: 'Đã phát gần đây',
      icon: Clock,
      count: 0,
      color: 'from-green-500 to-teal-600',
      page: 'recently-played',
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">

      {/* Header */}
      <div>
        <h2 className="mb-2">Thư viện của bạn</h2>
        <p className="text-blue-300">
          Tất cả âm nhạc bạn yêu thích ở một nơi
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              onClick={() => onNavigate(category.page)}
              className="bg-gradient-to-br from-blue-900/40 to-cyan-800/20 backdrop-blur rounded-lg p-4 sm:p-6 hover:from-blue-800/60 hover:to-cyan-700/40 transition-all group text-left"
            >
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              <p className="mb-1 text-sm sm:text-base">
                {category.name}
              </p>

              <p className="text-xs sm:text-sm text-blue-300">
                {category.count}
                {category.name === "Đang theo dõi"
                  ? " nghệ sĩ"
                  : " mục"}
              </p>

            </button>
          );
        })}
      </div>

      {/* Liked Songs List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="white"
              />
            </div>

            <div>
              <h3 className="text-base sm:text-lg">
                Bài hát yêu thích gần đây
              </h3>

              <p className="text-xs sm:text-sm text-blue-300">
                {likedSongs.length} bài hát
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-[50px_1fr_1fr_100px] gap-4 px-4 py-2 text-sm text-blue-300 border-b border-blue-700/30">
          <span>#</span>
          <span>Tên bài hát</span>
          <span>Album</span>
          <span className="text-right">Thời lượng</span>
        </div>

        <div className="space-y-1">
          {likedSongs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic text-sm">
              Không có bài hát yêu thích nào. Hãy nhấn biểu tượng Trái Tim ở trình phát nhạc hoặc các trang danh sách!
            </div>
          ) : (
            likedSongs.map((song, index) => (
              <button
                key={song.id}
                onClick={() => onPlaySong(song, likedSongs)}
                className="w-full grid grid-cols-[40px_1fr_auto] md:grid-cols-[50px_1fr_1fr_100px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-800/30 transition-all group items-center"
              >
                <span className="text-blue-300 group-hover:text-white text-sm sm:text-base">
                  {index + 1}
                </span>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <ImageWithFallback
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded shadow-lg flex-shrink-0"
                  />

                  <div className="text-left min-w-0">
                    <p className="truncate group-hover:text-cyan-300 transition-colors text-sm sm:text-base">
                      {song.title}
                    </p>

                    <p className="text-xs sm:text-sm text-blue-300 truncate">
                      {song.artistName}
                    </p>
                  </div>
                </div>

                <p className="hidden md:block text-blue-300 text-left truncate">
                  {song.albumName}
                </p>

                <p className="text-blue-300 text-right text-xs sm:text-sm">
                  {song.duration}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

    </div>
  );
}