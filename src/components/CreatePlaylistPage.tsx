import { Plus, RefreshCw } from 'lucide-react';
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
import { getUserHistory, getAllPublicSongs } from '../../api/apiclient';

import PlaylistCover from './PlaylistCover';

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
  const [isRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH SONGS ================= */
  useEffect(() => {
    const fetchSuggestedSongs = async () => {
      try {
        // Ưu tiên lấy tất cả bài hát công khai để gợi ý
        const res = await getAllPublicSongs();
        setSuggestedSongs(res.data.slice(0, 10));
      } catch (err) {
        console.error("Lỗi lấy danh sách nhạc, thử lấy lịch sử làm gợi ý...");
        // ✅ DÙNG HÀM MỚI: Nếu không lấy được nhạc hệ thống, lấy nhạc đã nghe gần đây
        if (currentUserId) {
          try {
            const recentRes = await getUserHistory(currentUserId);
            // Chuyển đổi từ HistoryItem sang Song
            const historySongs = recentRes.data.map(item => item.songDetails);
            setSuggestedSongs(historySongs.slice(0, 10));
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
        "http://localhost:8081/api/playlists",
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

            {/* SUGGESTIONS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Gợi ý cho bạn</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuggestedSongs([...suggestedSongs].sort(() => 0.5 - Math.random()))}
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