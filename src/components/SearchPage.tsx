import { Play, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { searchAll } from '../../api/apiclient';
import type { Song, Category, SearchResponse } from '../../api/apiclient';
import type { Artist } from '../../api/artistApi';
import { useAllArtists, useCategories, useSongsByCategory } from '../hooks/useMusicQueries';

interface SearchPageProps {
  searchQuery: string;
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
  onArtistClick?: (artist: any) => void;
  onPlaylistClick?: (playlist: any) => void;
}

export function SearchPage({ searchQuery, onPlaySong, onArtistClick, onPlaylistClick }: SearchPageProps) {
  const emptySearch: SearchResponse = {
    songs: [],
    artists: [],
    playlists: []
  };

  const [searchResult, setSearchResult] = useState<SearchResponse>(emptySearch);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả'); // Ensure selectedGenre is initialized
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Call API Categories
  const { data: dbCategories } = useCategories();

  // Call API Songs by Category if selected
  const { data: categorySongs, isLoading: isLoadingCategorySongs } = useSongsByCategory(selectedCategory?.id || null);

  const { data: artists } = useAllArtists();

  // Lọc nghệ sĩ theo thể loại
  const artistsByGenre = useMemo(() => {
    if (!artists || !selectedCategory) return [];
    return artists.filter((art: any) => {
      if (art.genres && Array.isArray(art.genres)) {
        return art.genres.map((g: string) => g.toLowerCase().trim()).includes(selectedCategory.name.toLowerCase().trim());
      }
      return false;
    });
  }, [artists, selectedCategory]);

  // Logic for "Tâm trạng & Thể loại" from HomePage
  const genres = useMemo(() => {
    if (!artists || !Array.isArray(artists)) return [];
    const allGenres = new Set<string>();
    artists.forEach((art: any) => {
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
  }, [artists]);

  // --- LOGIC CALL API ---
  useEffect(() => {
    const fetchResults = async () => {
      const keyword = searchQuery.trim();

      if (keyword.length < 2) {
        setSearchResult(emptySearch);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await searchAll(keyword);
        const data = response.data as SearchResponse;
        const mappedSongs = (data.songs || []).map((song: any) => ({
          ...song,
          coverImageUrl: song.imageUrl || song.coverImageUrl
        }));
        setSearchResult({
          ...data,
          songs: mappedSongs
        });
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setSearchResult(emptySearch);
      } finally {
        setLoading(false);
      }
    };

    // Debounce for search results
    const searchTimeoutId = setTimeout(() => fetchResults(), 300);

    return () => {
      clearTimeout(searchTimeoutId);
    };
  }, [searchQuery]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This function would typically update the searchQuery state if it were controlled by this component.
    // Since searchQuery is a prop, we'll assume it's managed externally and this component
    // just reacts to changes.
  };

  // Reset selected genre when query changes
  useEffect(() => {
    setSelectedGenre('Tất cả');
  }, [searchQuery]);

  // Tìm nghệ sĩ tương ứng cho từng bài hát trong kết quả
  const getArtistForSong = (artistId: string | undefined) => {
    if (!artists || !Array.isArray(artists) || !artistId) return null;
    return artists.find(a => a.id === artistId);
  };

  // Trích xuất tất cả thể loại từ các nghệ sĩ của bài hát kết quả
  const availableGenres = useMemo(() => {
    if (!searchResult.songs || searchResult.songs.length === 0 || !artists) return ['Tất cả'];
    const genreSet = new Set<string>();
    genreSet.add('Tất cả');

    searchResult.songs.forEach((song: any) => {
      const artist = getArtistForSong(song.artistId || song.artist_id);
      if (artist && artist.genres && Array.isArray(artist.genres)) {
        artist.genres.forEach((g: string) => {
          if (g && g.trim()) {
            const normalized = g.trim().split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            genreSet.add(normalized);
          }
        });
      }
    });

    return Array.from(genreSet);
  }, [searchResult.songs, artists]);

  // Lọc bài hát theo thể loại được chọn
  const filteredSongs = useMemo(() => {
    if (selectedGenre === 'Tất cả') return searchResult.songs;
    return searchResult.songs.filter((song: any) => {
      const artist = getArtistForSong(song.artistId || song.artist_id);
      if (!artist || !artist.genres) return false;
      return artist.genres.map((g: string) => g.toLowerCase()).includes(selectedGenre.toLowerCase());
    });
  }, [searchResult.songs, selectedGenre, artists]);

  // Hàm tiện ích định dạng thời gian
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Kiểm tra xem có phải là kết quả của một nghệ sĩ duy nhất không
  const isSingleArtistResult = filteredSongs.length > 0 && filteredSongs.every(song => song.artistName === filteredSongs[0].artistName);

  return (
    <div className="px-8 py-6 space-y-8">
      {searchQuery ? (
        /* Search Results */
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-white text-2xl font-bold">Kết quả tìm kiếm cho "{searchQuery}"</h2>
            {loading && <span className="text-cyan-400 animate-pulse text-sm">Đang tìm...</span>}
          </div>

          {searchResult.songs.length > 0 ? (
            <>
              {/* Thể loại lọc */}
              {availableGenres.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedGenre === genre
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md scale-105'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}

              {/* Top Result */}
              {selectedGenre === 'Tất cả' && searchResult.songs.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 text-blue-300 font-semibold uppercase tracking-wider text-sm">Kết quả hàng đầu</h3>
                  <button
                    onClick={() => onPlaySong(searchResult.songs[0], searchResult.songs)}
                    className="relative z-10 bg-gradient-to-br from-blue-900/60 to-cyan-800/40 backdrop-blur rounded-lg p-6 hover:from-blue-800/70 hover:to-cyan-700/50 transition-all group max-w-md w-full text-left border border-white/5 hover:border-cyan-500/30"
                  >
                    <ImageWithFallback
                      src={searchResult.songs[0].coverImageUrl}
                      alt={searchResult.songs[0].title}
                      className="w-32 h-32 rounded-lg shadow-2xl mb-4 object-cover"
                    />
                    <h3 className="mb-2 group-hover:text-cyan-300 transition-colors font-bold text-2xl text-white">
                      {searchResult.songs[0].title}
                    </h3>
                    <div className="flex items-center gap-2 text-blue-300">
                      <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-medium">Bài hát</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/90">{searchResult.songs[0].artistName}</span>
                    </div>
                  </button>
                </div>
              )}

              {searchResult.artists.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 text-blue-300 font-semibold uppercase tracking-wider text-sm">
                    Nghệ sĩ
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResult.artists.map((artist: any) => (
                      <div
                        key={artist.referenceId}
                        className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
                        onClick={() => onArtistClick && onArtistClick(artist)}
                      >
                        <img
                          src={artist.imageUrl}
                          className="w-full aspect-square rounded-full object-cover"
                        />

                        <h4 className="mt-3 text-white font-bold truncate">
                          {artist.title}
                        </h4>

                        <p className="text-sm text-gray-400">
                          Artist
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResult.playlists.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 text-blue-300 font-semibold uppercase tracking-wider text-sm">
                    Playlists
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResult.playlists.map((playlist: any) => (
                      <div
                        key={playlist.id}
                        className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
                        onClick={() => onPlaylistClick && onPlaylistClick(playlist)}
                      >
                        <img
                          src={playlist.coverImageUrl || "https://via.placeholder.com/150"}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        <h4 className="mt-3 text-white font-bold truncate">
                          {playlist.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Playlist
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Songs Results List */}
              <div>
                {/* ✅ Tiêu đề thông minh */}
                <h3 className="mb-4 text-blue-300 font-semibold uppercase tracking-wider text-sm">
                  {isSingleArtistResult ? `Bài hát của ${filteredSongs[0]?.artistName}` : 'Bài hát'}
                </h3>
                <div className="space-y-2">
                  {filteredSongs.map((song: Song, index: number) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        console.log("SearchPage: Clicking song", song);
                        if (!song.streamUrl) {
                          toast.error(`Bài hát ${song.title} không có link stream!`);
                        }
                        onPlaySong(song, filteredSongs);
                      }}
                      className="relative z-10 w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all group border border-transparent hover:border-white/5 cursor-pointer text-left"
                    >
                      <span className="text-blue-300 w-6 text-center font-mono">{index + 1}</span>
                      <ImageWithFallback
                        src={song.coverImageUrl}
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
      ) : selectedCategory ? (
        /* Category Detail View */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Thể loại danh mục</span>
              <h2 className="text-white text-3xl font-extrabold">{selectedCategory.name}</h2>
            </div>
          </div>

          {isLoadingCategorySongs ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60">Đang tải...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {artistsByGenre.map((artist: any) => (
                <div key={artist.id} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors">
                  <ImageWithFallback
                    src={artist.avatarUrl || artist.avatar}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover mb-4 shadow-lg"
                  />
                  <h4 className="text-white font-bold text-center truncate">{artist.name}</h4>
                </div>
              ))}
              {artistsByGenre.length === 0 && (
                <p className="text-white/40 italic py-10 col-span-full text-center">Không tìm thấy nghệ sĩ nào trong thể loại này.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Browse Categories */
        <div>
          <h3 className="mb-4 text-xl font-bold">Tâm trạng & Thể loại</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(genres.length > 0 ? genres : ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz', 'R&B', 'Classical', 'Country']).map((genre, index) => {
              const gradients = [
                'linear-gradient(135deg, #ec4899, #f43f5e)',
                'linear-gradient(135deg, #a855f7, #6366f1)',
                'linear-gradient(135deg, #f59e0b, #ea580c)',
                'linear-gradient(135deg, #14b8a6, #059669)',
                'linear-gradient(135deg, #06b6d4, #3b82f6)',
                'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                'linear-gradient(135deg, #ef4444, #ec4899)',
                'linear-gradient(135deg, #10b981, #0f766e)'
              ];
              const gradientStyle = { background: gradients[index % gradients.length] };

              const genreArtists = (artists || []).filter((art: any) => {
                if (art.genres && Array.isArray(art.genres)) {
                  return art.genres.map((g: string) => g.toLowerCase().trim()).includes(genre.toLowerCase().trim());
                }
                return false;
              });
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
                  onClick={() => {
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
      )}
    </div>
  );
}