import { Play } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Artist } from '../../api/artistApi';
import type { Song } from '../../api/apiclient';
import PlaylistCover from './PlaylistCover';
import {
  useTrendingSongs,
  useAllArtists,
  usePublicPlaylists,
  useAllPublicSongs,
  useUserHistory
} from '../hooks/useMusicQueries';

interface HomePageProps {
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
  onArtistClick?: (artist: Artist) => void;
  onPlaylistClick?: (playlist: any) => void;
  onGenreClick?: (genreName: string, category?: string) => void;
}

import { queryClient } from '../lib/queryClient';

export function HomePage({ onPlaySong, onArtistClick, onPlaylistClick, onGenreClick }: HomePageProps) {
  const [greeting, setGreeting] = useState('Chào buổi tối');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // ================= REFETCH FRESH DATA ON MOUNT =================
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['songs'] });
    queryClient.invalidateQueries({ queryKey: ['artists'] });
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
    queryClient.invalidateQueries({ queryKey: ['user-history'] });
  }, []);

  // ================= GREETING =================
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Chào buổi sáng');
    else if (hour >= 12 && hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const userId = localStorage.getItem('userId');

  // ================= REACT QUERY CUSTOM HOOKS =================
  const { data: trendingData, isLoading: isLoadingTrending, error: errorTrending } = useTrendingSongs(18);
  const { data: artistsData, isLoading: isLoadingArtists } = useAllArtists();
  const { data: playlistsData, isLoading: isLoadingPlaylists } = usePublicPlaylists();
  const { data: allPublicSongsData, isLoading: isLoadingAllSongs } = useAllPublicSongs();
  const { data: recentHistoryData, isLoading: isLoadingRecent } = useUserHistory(userId);

  // ================= MEMOIZED DATA PROCESSING =================
  const recentlyPlayed = useMemo(() => {
    if (recentHistoryData && Array.isArray(recentHistoryData)) {
      return recentHistoryData.map((item: any) => item.songDetails).filter(Boolean).slice(0, 6);
    }
    if (trendingData && Array.isArray(trendingData)) {
      return trendingData.slice(0, 6);
    }
    return [];
  }, [recentHistoryData, trendingData]);

  const recommendedSongs = useMemo(() => {
    if (!allPublicSongsData || !Array.isArray(allPublicSongsData) || allPublicSongsData.length === 0) return [];
    const seen = new Set<string>();
    const uniqueSongs: Song[] = [];
    for (const song of allPublicSongsData) {
      if (song && song.title) {
        const normalized = song.title.toLowerCase().trim();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          uniqueSongs.push(song);
        }
      }
    }
    return [...uniqueSongs].sort(() => 0.5 - Math.random()).slice(0, 15);
  }, [allPublicSongsData]);

  const featuredArtists = useMemo(() => {
    if (!artistsData || !Array.isArray(artistsData)) return [];
    const seen = new Set<string>();
    const uniqueArtists: Artist[] = [];
    for (const artist of artistsData) {
      if (artist && artist.name) {
        const normalizedName = artist.name.toLowerCase().trim();
        if (!seen.has(normalizedName)) {
          seen.add(normalizedName);
          uniqueArtists.push(artist);
        }
      }
    }
    return uniqueArtists.slice(0, 5);
  }, [artistsData]);

  const featuredPlaylists = useMemo(() => {
    if (!playlistsData || !Array.isArray(playlistsData)) return [];
    return playlistsData.slice(0, 6);
  }, [playlistsData]);

  const genres = useMemo(() => {
    if (!artistsData || !Array.isArray(artistsData)) return [];
    const allGenres = new Set<string>();
    artistsData.forEach((art: any) => {
      if (art.genres && Array.isArray(art.genres)) {
        art.genres.forEach((g: string) => {
          if (g && g.trim()) {
            const normalized = g.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            allGenres.add(normalized);
          }
        });
      }
    });
    return Array.from(allGenres).slice(0, 8);
  }, [artistsData]);

  const loading = isLoadingTrending || isLoadingArtists || isLoadingPlaylists || isLoadingAllSongs || (userId ? isLoadingRecent : false);
  const error = errorTrending ? 'Không thể tải dữ liệu trang chủ.' : null;

  // ================= UTILS =================
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
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
            <ImageWithFallback
              src={song.coverUrl}
              alt={song.title}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded shadow-lg flex-shrink-0"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-sm sm:text-base font-medium">{song.title}</p>
              <p className="text-xs sm:text-sm text-blue-300 truncate">
                {song.artistName}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-cyan-500/30 flex-shrink-0">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const getArtistRecommendationSections = () => {
    if (featuredArtists.length === 0) return [];
    
    // Lấy tối đa 3 nghệ sĩ làm gốc
    const baseArtists = featuredArtists.slice(0, 3);
    
    return baseArtists.map((artist, idx) => {
      // Tìm các nghệ sĩ khác để đề xuất (loại trừ nghệ sĩ hiện tại)
      const otherArtists = featuredArtists.filter(a => a.id !== artist.id).slice(0, 3);
      
      // Lấy 2 playlist thực tế cho mỗi section
      const playlistOffset = idx * 2;
      const sectionPlaylists = featuredPlaylists.slice(playlistOffset, playlistOffset + 2);
      
      // Tạo danh sách 6 item
      const items: any[] = [];
      
      // 1. Item Radio của nghệ sĩ đó (Square)
      const otherNames = otherArtists.map(a => a.name).join(', ');
      items.push({
        type: 'radio',
        title: `${artist.name} Radio`,
        image: (artist as any).avatarUrl || (artist as any).avatar || (artist as any).imageUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300",
        desc: otherNames ? `Với ${otherNames}...` : "Tuyển tập các ca khúc được yêu thích",
        raw: artist
      });
      
      // 2. Các item Playlist (Square)
      sectionPlaylists.forEach(pl => {
        items.push({
          type: 'playlist',
          title: pl.name,
          image: pl.coverImage || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
          desc: pl.description || `Playlist nổi bật`,
          raw: pl
        });
      });
      
      // 3. Các item Nghệ sĩ liên quan (Round)
      otherArtists.forEach(art => {
        items.push({
          type: 'artist',
          title: art.name,
          image: (art as any).avatarUrl || (art as any).avatar || (art as any).imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          desc: "Nghệ sĩ",
          raw: art
        });
      });
      
      // Nếu chưa đủ 6 items, lấp đầy bằng các bài hát đề xuất thực tế (Square)
      const needed = 6 - items.length;
      if (needed > 0) {
        const padSongs = recommendedSongs.slice(idx * 2, idx * 2 + needed);
        padSongs.forEach(song => {
          items.push({
            type: 'song',
            title: song.title,
            image: song.coverUrl || (song as any).coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
            desc: song.artistName,
            raw: song
          });
        });
      }
      
      return {
        artistName: artist.name,
        artistAvatar: (artist as any).avatarUrl || (artist as any).avatar || (artist as any).imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        items: items.slice(0, 6),
        rawArtist: artist
      };
    });
  };

  // ================= JSX (GIỮ NGUYÊN) =================
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      <div>
        <h2 className="mb-2 text-3xl font-bold">{greeting}</h2>
        <p className="text-blue-300">Khám phá âm nhạc yêu thích của bạn</p>
      </div>

      {error && (
        <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Featured Hero Banner */}
      {!loading && recommendedSongs.length > 0 && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-cyan-900 to-indigo-950 border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-cyan-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.15),transparent)] pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="px-3.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Nổi bật trong tuần
            </span>
            <h1 className="text-3xl md:text-5xl font-black mt-4 mb-3 leading-tight tracking-tight text-white">
              {recommendedSongs[0].title}
            </h1>
            <p className="text-slate-300 text-sm md:text-base mb-6">
              Nghe bản phát hành nóng hổi nhất của {recommendedSongs[0].artistName} ngay hôm nay. Chỉ có trên MusicStream.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => onPlaySong(recommendedSongs[0], recommendedSongs)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 text-white font-bold rounded-full transition-all flex items-center gap-2 border-0 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" /> Phát ngay
              </button>
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all cursor-pointer">
                Thêm vào thư viện
              </button>
            </div>
          </div>
          <div className="relative w-48 h-48 md:w-60 md:h-60 shrink-0 group cursor-pointer">
            <ImageWithFallback
              src={recommendedSongs[0].coverUrl}
              alt={recommendedSongs[0].title}
              className="w-full h-full object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-300">
                <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moods & Genres */}
      <div>
        <h3 className="mb-4 text-xl font-bold">Tâm trạng & Thể loại</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(genres.length > 0 ? genres : ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz', 'R&B', 'Classical', 'Country']).map((genre, index) => {
            const gradients = [
              'linear-gradient(135deg, #ec4899, #f43f5e)', // pink to rose
              'linear-gradient(135deg, #a855f7, #6366f1)', // purple to indigo
              'linear-gradient(135deg, #f59e0b, #ea580c)', // amber to orange
              'linear-gradient(135deg, #14b8a6, #059669)', // teal to emerald
              'linear-gradient(135deg, #06b6d4, #3b82f6)', // cyan to blue
              'linear-gradient(135deg, #8b5cf6, #7c3aed)', // violet to purple
              'linear-gradient(135deg, #ef4444, #ec4899)', // red to pink
              'linear-gradient(135deg, #10b981, #0f766e)'  // emerald to teal
            ];
            const gradientStyle = { background: gradients[index % gradients.length] };

            // Tìm các nghệ sĩ thuộc thể loại này
            const genreArtists = (artistsData || []).filter((art: any) => {
              if (art.genres && Array.isArray(art.genres)) {
                return art.genres.map((g: string) => g.toLowerCase().trim()).includes(genre.toLowerCase().trim());
              }
              return false;
            });
            // Lấy ảnh nghệ sĩ ngẫu nhiên ổn định (tránh nhấp nháy khi render lại)
            const getGenreHashIndex = (str: string, len: number) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
              }
              return Math.abs(hash) % len;
            };
            const artistImage = genreArtists.length > 0
              ? (genreArtists[getGenreHashIndex(genre, genreArtists.length)].avatarUrl || 
                 genreArtists[getGenreHashIndex(genre, genreArtists.length)].avatar || 
                 (genreArtists[getGenreHashIndex(genre, genreArtists.length)] as any).imageUrl)
              : null;

            return (
              <div
                key={genre}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory({ name: genre, id: genre });
                }}
                style={gradientStyle}
                className="relative h-24 rounded-2xl p-4 overflow-hidden shadow-lg group hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="font-extrabold text-lg text-white capitalize relative z-10">{genre}</span>
                {artistImage && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md transform rotate-[15deg] translate-x-1 group-hover:rotate-[0deg] group-hover:scale-110 transition-all duration-300 flex-shrink-0 relative z-10">
                    <img src={artistImage} alt={genre} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Genre Detail View */}
      {selectedCategory && (
        <div className="space-y-6 bg-black/40 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Nghệ sĩ thể loại: {selectedCategory.name}</h2>
            <button onClick={() => setSelectedCategory(null)} className="text-sm text-cyan-400 hover:text-white">Đóng</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {(artistsData || []).filter((art: any) => 
              art.genres?.map((g: string) => g.toLowerCase().trim()).includes(selectedCategory.name.toLowerCase().trim())
            ).map((artist: any) => (
              <div key={artist.id} onClick={() => onArtistClick?.(artist)} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <ImageWithFallback src={artist.avatarUrl || artist.avatar} alt={artist.name} className="w-full aspect-square rounded-full object-cover mb-4 shadow-lg" />
                <h4 className="text-white font-bold text-center truncate">{artist.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Similar Recommendation Sections */}
      {!loading && !selectedCategory && getArtistRecommendationSections().map((section, secIdx) => (
        <div key={secIdx} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-md flex-shrink-0">
                <ImageWithFallback src={section.artistAvatar} alt={section.artistName} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">Nội dung khác giống</p>
                <h3 className="text-xl sm:text-2xl font-black text-white">{section.artistName}</h3>
              </div>
            </div>
            <button 
              onClick={() => onArtistClick?.(section.rawArtist)}
              className="text-sm text-slate-400 hover:text-white font-bold transition-colors bg-transparent border-0 cursor-pointer"
            >
              Hiện tất cả
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {section.items.map((item, itemIdx) => (
              <div 
                key={itemIdx}
                onClick={() => {
                  if (item.type === 'artist' || item.type === 'radio') {
                    onArtistClick?.(item.raw);
                  } else if (item.type === 'playlist') {
                    onPlaylistClick?.(item.raw);
                  } else if (item.type === 'song') {
                    onPlaySong?.(item.raw, recommendedSongs);
                  }
                }}
                className="bg-slate-900/30 backdrop-blur border border-white/5 p-4 rounded-2xl hover:bg-slate-800/40 transition-all cursor-pointer group"
              >
                <div className="relative mb-4">
                  <div className={`aspect-square w-full overflow-hidden shadow-lg flex-shrink-0 ${item.type === 'artist' ? 'rounded-full' : 'rounded-xl'}`}>
                    {item.type === 'playlist' ? (
                      <PlaylistCover
                        coverImage={item.raw?.coverImage}
                        tracks={item.raw?.songDetails || []}
                        name={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  {item.type !== 'artist' && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg shadow-cyan-500/30">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm sm:text-base text-white truncate mb-1">{item.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!loading &&
        recentlyPlayed.length > 0 &&
        renderSongSection('Phát gần đây', recentlyPlayed, recentlyPlayed)}

      {/* ===== ARTISTS ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Nghệ sĩ nổi bật</h3>
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
                <ImageWithFallback
                  src={(artist as any).avatarUrl || (artist as any).avatar || (artist as any).imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {artist.name}
                </h4>
                <p className="text-xs text-blue-300 mt-1">Nghệ sĩ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PLAYLISTS ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Playlist nổi bật</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {featuredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onPlaylistClick?.(playlist)}
              className="bg-gradient-to-b from-blue-900/30 to-transparent backdrop-blur rounded-lg p-3 sm:p-4 hover:bg-blue-800/40 transition-all cursor-pointer group"
            >
              <div className="relative mb-3 sm:mb-4">
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
              <p className="mb-2 truncate text-sm sm:text-base font-semibold">
                {playlist.name}
              </p>
              <p className="text-xs sm:text-sm text-blue-300 line-clamp-2">
                {playlist.description || 'Playlist dành cho bạn'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RECOMMENDED ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Đề xuất cho bạn</h3>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">
            Xem thêm
          </button>
        </div>
        {!loading && (
          <div className="space-y-2">
            {recommendedSongs.map((song, index) => (
              <button
                key={song.id}
                onClick={() => onPlaySong(song, recommendedSongs)}
                className="w-full flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-blue-800/30 transition-all group"
              >
                <span className="text-blue-300 w-6 text-center">
                  {index + 1}
                </span>
                <ImageWithFallback
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded shadow-lg"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate font-medium">{song.title}</p>
                  <p className="text-sm text-blue-300 truncate">
                    {song.artistName}
                  </p>
                </div>
                <p className="hidden md:block text-sm text-blue-300 truncate">
                  {song.albumName}
                </p>
                <p className="text-sm text-blue-300 w-16 text-right">
                  {formatDuration(song.duration)}
                </p>
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-4 h-4 text-white" fill="white" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}