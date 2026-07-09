import { Plus, RefreshCw, Shuffle, Trash2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { toast } from "sonner";
import axios from "axios";
import type { Song } from '../../api/apiclient';

// ✅ SỬA LỖI: Import đúng tên hàm getUserHistory từ apiclient
import { getUserHistory, getAllPublicSongs, searchPublicSongs } from '../../api/apiclient';

import PlaylistCover from './PlaylistCover';
import { BASE_URL } from '../../api/apiconfig';

interface CreatePlaylistPageProps {
  onBack: () => void;
  currentUserId: string;
  isAdmin?: boolean;
  onCreated?: (playlist: any) => void;
}

export function CreatePlaylistPage({
  onBack,
  currentUserId,
  isAdmin = false,
  onCreated
}: CreatePlaylistPageProps) {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage] = useState<string | null>(null);

  const [addedSongs, setAddedSongs] = useState<Set<string>>(new Set());
  const [addedSongObjects, setAddedSongObjects] = useState<Song[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearchingSongs, setIsSearchingSongs] = useState(false);

  // Debounced search for songs
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchingSongs(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await searchPublicSongs(searchQuery);
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi tìm kiếm bài hát:", err);
      } finally {
        setIsSearchingSongs(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  /* ================= FETCH SONGS ================= */
  useEffect(() => {
    const fetchSuggestedSongs = async () => {
      try {
        const res = await getAllPublicSongs();
        const songs = res.data;
        setAllSongs(songs);
        const shuffled = [...songs].sort(() => 0.5 - Math.random());
        setSuggestedSongs(shuffled.slice(0, 10));
      } catch (err) {
        console.error("Lỗi lấy danh sách nhạc, thử lấy lịch sử làm gợi ý...");
        if (currentUserId) {
          try {
            const recentRes = await getUserHistory(currentUserId);
            const historySongs = recentRes.data.map(item => item.songDetails);
            setAllSongs(historySongs);
            const shuffled = [...historySongs].sort(() => 0.5 - Math.random());
            setSuggestedSongs(shuffled.slice(0, 10));
          } catch (historyErr) {
            console.error("Không thể lấy dữ liệu gợi ý");
          }
        }
      }
    };
    fetchSuggestedSongs();
  }, [currentUserId]);

  /* ================= ADD SONG ================= */
  const handleAddSong = (song: Song) => {
    if (addedSongs.has(song.id)) return;
    setAddedSongs(prev => new Set(prev).add(song.id));
    setAddedSongObjects(prev => [...prev, song]);
    toast.success(`Đã thêm "${song.title}"`);
  };

  /* ================= REMOVE SONG ================= */
  const handleRemoveSong = (songId: string) => {
    setAddedSongs(prev => {
      const next = new Set(prev);
      next.delete(songId);
      return next;
    });
    setAddedSongObjects(prev => prev.filter(song => song.id !== songId));
    toast.info("Đã xóa bài hát khỏi danh sách");
  };

  /* ================= RANDOMIZE SONGS ================= */
  const handleAddRandomSongs = (count: number) => {
    if (allSongs.length === 0) {
      toast.error("Không tìm thấy bài hát nào để chọn ngẫu nhiên.");
      return;
    }
    
    // Lọc ra các bài chưa được thêm
    const availableSongs = allSongs.filter(song => !addedSongs.has(song.id));
    
    if (availableSongs.length === 0) {
      toast.info("Tất cả bài hát sẵn có đều đã được thêm!");
      return;
    }

    // Trộn ngẫu nhiên các bài hát sẵn có
    const shuffled = [...availableSongs].sort(() => 0.5 - Math.random());
    const toAdd = shuffled.slice(0, count);

    setAddedSongs(prev => {
      const next = new Set(prev);
      toAdd.forEach(s => next.add(s.id));
      return next;
    });
    setAddedSongObjects(prev => [...prev, ...toAdd]);
    toast.success(`Đã tự động chọn và thêm ngẫu nhiên ${toAdd.length} bài hát!`);
  };

  /* ================= REFRESH SUGGESTIONS ================= */
  const handleRefreshSuggestions = () => {
    if (allSongs.length === 0) return;
    setIsRefreshing(true);
    const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
    setSuggestedSongs(shuffled.slice(0, 10));
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã làm mới danh sách gợi ý ngẫu nhiên!");
    }, 400);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        type: "user",
        isPublic,
        tracks: Array.from(addedSongs),
        coverImage: coverImage
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          "currentUserId": currentUserId,
          "isAdmin": isAdmin ? "true" : "false"
        }
      };

      // Đổi URL thành localhost nếu bạn đang chạy local, hoặc dùng biến môi trường
      const res = await axios.post(
        `${BASE_URL}/api/playlists`,
        payload,
        config
      );

      toast.success(`Playlist "${res.data.name}" đã tạo`);
      onCreated?.(res.data);
      onBack();

    } catch (err) {
      console.error("❌ Create playlist error:", err);
      toast.error("Tạo playlist thất bại. Kiểm tra kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto text-white">
      <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white/10">
        Quay lại
      </Button>

      <h1 className="text-3xl font-bold mb-8">Tạo Playlist Mới</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AREA PREVIEW */}
        <div className="lg:col-span-4 flex flex-col items-center gap-4">
          <div className="w-full aspect-square max-w-[300px]">
            <PlaylistCover
              coverImage={coverImage}
              tracks={addedSongObjects}
              name={name}
            />
          </div>
          <p className="text-sm text-white/40 italic text-center">
            {addedSongObjects.length < 4
              ? `Thêm ${4 - addedSongObjects.length} bài nữa để hoàn tất Grid ảnh`
              : "Ảnh bìa Grid 2x2 đã sẵn sàng"}
          </p>
        </div>

        {/* FORM */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Tên playlist</Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                placeholder="Tên playlist của tôi"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                className="bg-white/5 border-white/10 text-white"
                placeholder="Viết gì đó cho playlist này..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="space-y-0.5">
                <Label>Chế độ công khai</Label>
                <p className="text-xs text-white/40">Mọi người đều có thể tìm thấy playlist này</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* CHỌN NGẪU NHIÊN BÀI HÁT */}
            <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Shuffle className="w-5 h-5" />
                <span>Tự động chọn ngẫu nhiên bài hát</span>
              </div>
              <p className="text-xs text-white/60">
                Tạo playlist nhanh bằng cách thêm ngẫu nhiên các bài hát từ kho nhạc hệ thống.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddRandomSongs(5)}
                  className="bg-white/5 hover:bg-green-500 hover:text-black border-white/10"
                >
                  + Ngẫu nhiên 5 bài
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddRandomSongs(10)}
                  className="bg-white/5 hover:bg-green-500 hover:text-black border-white/10"
                >
                  + Ngẫu nhiên 10 bài
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddRandomSongs(20)}
                  className="bg-white/5 hover:bg-green-500 hover:text-black border-white/10"
                >
                  + Ngẫu nhiên 20 bài
                </Button>
                {addedSongObjects.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddedSongs(new Set());
                      setAddedSongObjects([]);
                      toast.info("Đã xóa tất cả bài hát khỏi danh sách");
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Xóa tất cả ({addedSongObjects.length})
                  </Button>
                )}
              </div>
            </div>

            {/* TÌM KIẾM BÀI HÁT */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Search className="w-4 h-4 text-green-400" />
                Tìm kiếm và thêm bài hát
              </Label>
              <div className="relative">
                <Input
                  className="bg-white/5 border-white/10 text-white pl-10 pr-4 h-10 w-full"
                  placeholder="Nhập tên bài hát hoặc ca sĩ..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>

              {searchQuery.trim() && (
                <div className="space-y-2 border border-white/10 rounded-lg p-3 bg-black/20 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center text-xs text-white/40 mb-1">
                    <span>Kết quả tìm kiếm ({searchResults.length})</span>
                    {isSearchingSongs && <span className="text-green-400 animate-pulse">Đang tìm...</span>}
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map(song => (
                      <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition-colors">
                        <img
                          src={song.coverUrl}
                          className="w-10 h-10 rounded object-cover shadow-md"
                          alt={song.title}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{song.title}</p>
                          <p className="text-xs text-white/40 truncate">{song.artistName}</p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant={addedSongs.has(song.id) ? "secondary" : "outline"}
                          className="rounded-full h-8 w-8"
                          onClick={() => {
                            if (addedSongs.has(song.id)) {
                              handleRemoveSong(song.id);
                            } else {
                              handleAddSong(song);
                            }
                          }}
                        >
                          {addedSongs.has(song.id) ? "✓" : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))
                  ) : (
                    !isSearchingSongs && (
                      <p className="text-xs text-white/40 text-center py-4">Không tìm thấy bài hát nào</p>
                    )
                  )}
                </div>
              )}
            </div>

            {/* BÀI HÁT ĐÃ CHỌN */}
            {addedSongObjects.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-white/80">
                  Bài hát đã chọn ({addedSongObjects.length})
                </Label>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-lg p-2 bg-white/5">
                  {addedSongObjects.map((song, index) => (
                    <div key={`${song.id}-${index}`} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition-colors">
                      <div className="text-xs text-white/40 w-5 text-center">{index + 1}</div>
                      <img
                        src={song.coverUrl}
                        className="w-10 h-10 rounded object-cover shadow-md"
                        alt={song.title}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{song.title}</p>
                        <p className="text-xs text-white/40 truncate">{song.artistName}</p>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                        onClick={() => handleRemoveSong(song.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUGGESTIONS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Gợi ý cho bạn</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshSuggestions}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Làm mới
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {suggestedSongs.map(song => (
                  <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition-colors">
                    <img
                      src={song.coverUrl}
                      className="w-12 h-12 rounded object-cover shadow-md"
                      alt={song.title}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">{song.title}</p>
                      <p className="text-xs text-white/40 truncate">{song.artistName}</p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant={addedSongs.has(song.id) ? "secondary" : "outline"}
                      className="rounded-full"
                      onClick={() => handleAddSong(song)}
                    >
                      {addedSongs.has(song.id) ? "✓" : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold h-12"
              disabled={loading || !name}
            >
              {loading ? "Đang xử lý..." : "Xác nhận tạo Playlist"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}