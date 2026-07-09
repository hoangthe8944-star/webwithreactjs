import { ArrowLeft, Play, User, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getArtistsByGenre, getSongsByArtist } from '../../api/artistApi';
import type { Artist } from '../../api/artistApi';
import type { Song } from '../../api/apiclient';
import { searchPublicSongs } from '../../api/apiclient';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GenreDetailPageProps {
  genreName: string;
  onBack: () => void;
  onArtistClick: (artist: Artist) => void;
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
}

export function GenreDetailPage({
  genreName,
  onBack,
  onArtistClick,
  onPlaySong
}: GenreDetailPageProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenreData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách nghệ sĩ theo thể loại
        const artistsRes = await getArtistsByGenre(genreName);
        const fetchedArtists: Artist[] = artistsRes.data || [];
        setArtists(fetchedArtists);

        // Lấy ngẫu nhiên/nổi bật một số bài hát của các nghệ sĩ này
        if (fetchedArtists.length > 0) {
          const songsPromises = fetchedArtists.slice(0, 3).map(async (artist) => {
            try {
              const res = await getSongsByArtist(artist.id);
              let artistSongs = res.data || [];
              if (artistSongs.length === 0 && artist.name) {
                const searchRes = await searchPublicSongs(artist.name);
                if (searchRes && searchRes.data && Array.isArray(searchRes.data)) {
                  artistSongs = searchRes.data.filter((s: Song) => s.artistName.toLowerCase().trim() === artist.name.toLowerCase().trim());
                  if (artistSongs.length === 0) {
                    artistSongs = searchRes.data.slice(0, 10);
                  }
                }
              }
              return artistSongs;
            } catch (e) {
              return [];
            }
          });

          const results = await Promise.all(songsPromises);
          const mergedSongs = results.flat().slice(0, 10); // Lấy tối đa 10 bài hát
          setSongs(mergedSongs);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thể loại:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreData();
  }, [genreName]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Thể loại âm nhạc</span>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
            {genreName}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60">Đang tải thể loại {genreName}...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Nghệ sĩ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-cyan-400" />
              Nghệ sĩ thể loại {genreName}
            </h2>
            {artists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => onArtistClick(artist)}
                    className="group flex flex-col items-center gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300">
                      <ImageWithFallback
                        src={artist.avatarUrl || (artist as any).avatar || (artist as any).imageUrl}
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
            ) : (
              <p className="text-white/40 italic">Chưa có nghệ sĩ nào thuộc thể loại này trong hệ thống.</p>
            )}
          </div>

          {/* Bài hát nổi bật */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Music className="w-6 h-6 text-cyan-400" />
              Bài hát nổi bật
            </h2>
            {songs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onPlaySong(song, songs)}
                    className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer group transition-all"
                  >
                    <ImageWithFallback
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate group-hover:text-cyan-400 transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-xs text-white/40 truncate">{song.artistName}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 italic">Chưa có bài hát nổi bật nào.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
