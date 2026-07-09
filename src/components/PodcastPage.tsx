import { useEffect, useState } from 'react';
import {
  Cast,
  Clock,
  Headphones,
  Mic,
  Radio,
  Play,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Layers,
  X,
  PlusCircle,
  FileAudio,
  Film
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { cn } from './lib/utils';
import type { Song } from '../../api/apiclient';
import * as podcastApi from '../../api/podcastApi';

interface PodcastPageProps {
  currentUserId: string;
  onPlaySong: (song: Song, contextPlaylist: Song[]) => void;
  onJoinLiveRoom: (roomId: string, isHost: boolean) => void;
}

export function PodcastPage({ currentUserId, onPlaySong, onJoinLiveRoom }: PodcastPageProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'studio'>('explore');
  const [selectedPodcast, setSelectedPodcast] = useState<podcastApi.Podcast | null>(null);

  // Data states
  const [podcasts, setPodcasts] = useState<podcastApi.Podcast[]>([]);
  const [episodes, setEpisodes] = useState<podcastApi.Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // Modals / Forms
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<podcastApi.Podcast | null>(null);
  const [podcastTitle, setPodcastTitle] = useState('');
  const [podcastDesc, setPodcastDesc] = useState('');
  const [podcastCategories, setPodcastCategories] = useState('');
  const [podcastCover, setPodcastCover] = useState<File | null>(null);

  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<podcastApi.Episode | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDesc, setEpisodeDesc] = useState('');
  const [episodeMediaFile, setEpisodeMediaFile] = useState<File | null>(null);

  // Category filter
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = [
    { id: 'all', label: 'Tất cả', icon: Mic },
    { id: 'Công nghệ', label: 'Công nghệ', icon: Radio },
    { id: 'Giáo dục', label: 'Giáo dục', icon: Headphones },
    { id: 'Giải trí', label: 'Giải trí', icon: Cast },
  ];

  // Fetch initial data
  const fetchPodcasts = async () => {
    setIsLoading(true);
    try {
      const res = await podcastApi.getAllPodcasts();
      setPodcasts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách podcast:', err);
      toast.error('Không thể tải danh sách podcast');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  // Fetch episodes when a podcast is selected
  useEffect(() => {
    if (selectedPodcast) {
      const fetchEpisodes = async () => {
        setIsLoadingEpisodes(true);
        try {
          const res = await podcastApi.getEpisodesByPodcastId(selectedPodcast.id);
          setEpisodes(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error('Lỗi lấy danh sách tập podcast:', err);
          toast.error('Không thể tải danh sách tập phát sóng');
        } finally {
          setIsLoadingEpisodes(false);
        }
      };
      fetchEpisodes();
    } else {
      setEpisodes([]);
    }
  }, [selectedPodcast]);

  // Handle Play Episode (Supports mp3 & mp4)
  const handlePlayEpisode = async (episode: podcastApi.Episode) => {
    const playUrl = episode.mediaUrl || episode.audioUrl;
    if (!playUrl) {
      toast.error('Tập phát sóng này chưa được tải lên file đa phương tiện!');
      return;
    }

    // Map Episode to Song schema for Player compatibility
    const mappedSong: Song = {
      id: episode.id,
      title: episode.title,
      artistName: selectedPodcast?.title || 'Podcast',
      albumName: episode.mediaType?.includes('video') || playUrl.toLowerCase().endsWith('.mp4') ? 'Video Podcast' : 'Audio Podcast',
      coverUrl: selectedPodcast?.coverImageUrl || selectedPodcast?.coverImage || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=200',
      duration: episode.duration ? Math.floor(episode.duration / 1000) : 0, // DTO durationMs to seconds
      streamUrl: playUrl,
      status: 'PUBLISHED' as const,
      viewCount: episode.playCount || 0,
      isExplicit: false,
      genre: selectedPodcast?.categories || []
    };

    const mappedQueue = episodes
      .filter(ep => ep.mediaUrl || ep.audioUrl)
      .map(ep => ({
        id: ep.id,
        title: ep.title,
        artistName: selectedPodcast?.title || 'Podcast',
        albumName: ep.mediaType?.includes('video') || (ep.mediaUrl || ep.audioUrl || '').toLowerCase().endsWith('.mp4') ? 'Video Podcast' : 'Audio Podcast',
        coverUrl: selectedPodcast?.coverImageUrl || selectedPodcast?.coverImage || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=200',
        duration: ep.duration ? Math.floor(ep.duration / 1000) : 0,
        streamUrl: ep.mediaUrl || ep.audioUrl || '',
        status: 'PUBLISHED' as const,
        viewCount: ep.playCount || 0,
        isExplicit: false,
        genre: selectedPodcast?.categories || []
      }));

    // Trigger listen count increment
    try {
      await podcastApi.listenEpisode(episode.id);
      // Update local count
      setEpisodes(prev => prev.map(e => e.id === episode.id ? { ...e, playCount: (e.playCount || 0) + 1 } : e));
    } catch (e) {
      console.error(e);
    }

    onPlaySong(mappedSong, mappedQueue);
  };

  // Create or Update Podcast Submit
  const handlePodcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastTitle.trim() || !podcastDesc.trim()) {
      toast.error('Vui lòng điền đủ Tiêu đề và Mô tả');
      return;
    }

    const formData = new FormData();
    formData.append('title', podcastTitle);
    formData.append('description', podcastDesc);
    formData.append('hostId', currentUserId || 'guest_host');
    
    const catList = podcastCategories.split(',').map(c => c.trim()).filter(Boolean);
    catList.forEach(c => formData.append('categories', c));

    if (podcastCover) {
      formData.append('coverImage', podcastCover);
    }

    try {
      if (editingPodcast) {
        await podcastApi.updatePodcast(editingPodcast.id, formData);
        toast.success('Cập nhật Podcast thành công');
      } else {
        await podcastApi.createPodcast(formData);
        toast.success('Tạo Podcast thành công');
      }
      setShowPodcastModal(false);
      setEditingPodcast(null);
      setPodcastTitle('');
      setPodcastDesc('');
      setPodcastCategories('');
      setPodcastCover(null);
      fetchPodcasts();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi yêu cầu xử lý Podcast');
    }
  };

  // Create or Update Episode Submit
  const handleEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPodcast) return;
    if (!episodeTitle.trim() || !episodeDesc.trim()) {
      toast.error('Vui lòng nhập đủ Tiêu đề và Mô tả cho tập phát sóng');
      return;
    }

    const formData = new FormData();
    formData.append('title', episodeTitle);
    formData.append('description', episodeDesc);
    formData.append('status', 'PUBLISHED');

    if (episodeMediaFile) {
      formData.append('audioFile', episodeMediaFile); // parameter name remains audioFile in multipart
      const isVideo = episodeMediaFile.type.includes('video') || episodeMediaFile.name.endsWith('.mp4');
      formData.append('mediaType', isVideo ? 'video/mp4' : 'audio/mpeg');
    } else if (!editingEpisode) {
      toast.error('Vui lòng tải lên file âm thanh/video cho tập phát sóng');
      return;
    }

    try {
      if (editingEpisode) {
        await podcastApi.updateEpisode(editingEpisode.id, formData);
        toast.success('Cập nhật tập phát sóng thành công');
      } else {
        await podcastApi.createEpisode(selectedPodcast.id, formData);
        toast.success('Thêm tập phát sóng thành công');
      }
      setShowEpisodeModal(false);
      setEditingEpisode(null);
      setEpisodeTitle('');
      setEpisodeDesc('');
      setEpisodeMediaFile(null);
      
      // Reload episodes list
      const res = await podcastApi.getEpisodesByPodcastId(selectedPodcast.id);
      setEpisodes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải file hoặc gửi yêu cầu episode');
    }
  };

  // Delete Podcast
  const handleDeletePodcast = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Podcast này và tất cả tập phát sóng bên trong?')) return;
    try {
      await podcastApi.deletePodcast(id);
      toast.success('Đã xóa Podcast');
      fetchPodcasts();
      if (selectedPodcast?.id === id) {
        setSelectedPodcast(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa Podcast');
    }
  };

  // Delete Episode
  const handleDeleteEpisode = async (episodeId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tập phát sóng này?')) return;
    try {
      await podcastApi.deleteEpisode(episodeId);
      toast.success('Đã xóa tập phát sóng');
      if (selectedPodcast) {
        const res = await podcastApi.getEpisodesByPodcastId(selectedPodcast.id);
        setEpisodes(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa tập phát sóng');
    }
  };

  const filteredPodcasts = podcasts.filter(p => {
    if (activeCategory === 'all') return true;
    return p.categories && p.categories.some(c => c.toLowerCase().includes(activeCategory.toLowerCase()));
  });

  const myPodcasts = podcasts.filter(p => p.hostId === currentUserId);

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        
        {/* ================= HERO STUDIO PANEL ================= */}
        {!selectedPodcast && (
          <section 
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
          >
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-md">
                  <Layers className="h-4 w-4" />
                  <span>Podcast Media Center</span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
                  Khám phá & Đăng tải các Series Podcast.
                </h1>

                <p className="text-base leading-relaxed text-slate-300">
                  Thư viện tổng hợp những tập phát sóng âm thanh (MP3) và video (MP4) sống động nhất. Bạn cũng có thể tự tạo các series độc quyền của riêng mình.
                </p>
              </div>

              {activeTab === 'studio' && (
                <Button
                  onClick={() => {
                    setEditingPodcast(null);
                    setPodcastTitle('');
                    setPodcastDesc('');
                    setPodcastCategories('');
                    setPodcastCover(null);
                    setShowPodcastModal(true);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl font-bold gap-2 px-6 h-12 shadow-lg shrink-0 self-start md:self-auto"
                >
                  <Plus className="w-5 h-5" /> Tạo Podcast mới
                </Button>
              )}
            </div>
          </section>
        )}

        {/* ================= TABS SELECTOR (Explore vs Creator Studio) ================= */}
        {!selectedPodcast && (
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('explore')}
                className={cn(
                  "text-lg font-black pb-2 px-1 transition-all border-b-2",
                  activeTab === 'explore' ? "text-cyan-400 border-cyan-400" : "text-slate-400 border-transparent hover:text-white"
                )}
              >
                Khám phá Podcast
              </button>
              <button
                onClick={() => setActiveTab('studio')}
                className={cn(
                  "text-lg font-black pb-2 px-1 transition-all border-b-2",
                  activeTab === 'studio' ? "text-cyan-400 border-cyan-400" : "text-slate-400 border-transparent hover:text-white"
                )}
              >
                Studio của tôi
              </button>
            </div>
          </div>
        )}

        {/* ================= EXPLORE TAB VIEW ================= */}
        {!selectedPodcast && activeTab === 'explore' && (
          <>
            {/* Categories Selector */}
            <section className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-bold border transition-all flex-shrink-0 cursor-pointer",
                      isSelected
                        ? "bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </section>

            {/* Podcasts Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Tất cả Series Podcast ({filteredPodcasts.length})</h2>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Đang tải danh mục...</p>
                </div>
              ) : filteredPodcasts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 italic">
                  Không tìm thấy series podcast nào thuộc danh mục này.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredPodcasts.map(podcast => (
                    <div
                      key={podcast.id}
                      onClick={() => setSelectedPodcast(podcast)}
                      className="group bg-slate-900/40 hover:bg-slate-800/40 p-4 border border-white/5 hover:border-cyan-500/25 rounded-2xl cursor-pointer transition-all flex flex-col gap-3"
                    >
                      <div className="aspect-square w-full rounded-xl overflow-hidden shadow-lg relative">
                        <ImageWithFallback
                          src={podcast.coverImageUrl || podcast.coverImage}
                          alt={podcast.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center scale-90 group-hover:scale-100 transition-all shadow-lg">
                            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-white truncate group-hover:text-cyan-400 transition-colors">
                          {podcast.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-1">Host ID: {podcast.hostId}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {podcast.categories && podcast.categories.map((c, i) => (
                            <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-semibold">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ================= STUDIO TAB VIEW (My Podcasts) ================= */}
        {!selectedPodcast && activeTab === 'studio' && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Series của tôi ({myPodcasts.length})</h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Đang tải...</p>
              </div>
            ) : myPodcasts.length === 0 ? (
              <div className="text-center py-20 text-slate-400 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/5">
                <p className="italic">Bạn chưa sở hữu series podcast nào.</p>
                <Button
                  onClick={() => {
                    setEditingPodcast(null);
                    setPodcastTitle('');
                    setPodcastDesc('');
                    setPodcastCategories('');
                    setPodcastCover(null);
                    setShowPodcastModal(true);
                  }}
                  className="bg-cyan-500 text-black font-bold hover:bg-cyan-400 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" /> Tạo ngay series đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPodcasts.map(podcast => (
                  <div 
                    key={podcast.id}
                    className="p-5 rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur flex gap-4 hover:border-cyan-500/20 transition-all group"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                      <ImageWithFallback
                        src={podcast.coverImageUrl || podcast.coverImage}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 
                          onClick={() => setSelectedPodcast(podcast)}
                          className="font-extrabold text-lg text-white hover:text-cyan-400 cursor-pointer truncate"
                        >
                          {podcast.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{podcast.description}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPodcast(podcast)}
                          className="h-8 rounded-lg font-bold text-xs"
                        >
                          Tập phát sóng
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPodcast(podcast);
                            setPodcastTitle(podcast.title);
                            setPodcastDesc(podcast.description);
                            setPodcastCategories(podcast.categories ? podcast.categories.join(', ') : '');
                            setPodcastCover(null);
                            setShowPodcastModal(true);
                          }}
                          className="h-8 rounded-lg text-xs font-bold border-white/10 text-slate-300 hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePodcast(podcast.id)}
                          className="h-8 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= PODCAST DETAIL VIEW ================= */}
        {selectedPodcast && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Back button */}
            <button
              onClick={() => setSelectedPodcast(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold border-0 bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" /> Trở lại danh sách
            </button>

            {/* Podcast Cover Info Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
                <ImageWithFallback
                  src={selectedPodcast.coverImageUrl || selectedPodcast.coverImage}
                  alt={selectedPodcast.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap gap-2">
                  {selectedPodcast.categories && selectedPodcast.categories.map((c, i) => (
                    <span key={i} className="text-xs bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 font-bold px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">{selectedPodcast.title}</h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-300 font-semibold items-center">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-4.5 h-4.5 text-cyan-400" /> Host: {selectedPodcast.hostId}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4.5 h-4.5 text-cyan-400" /> {episodes.length} tập phát sóng
                  </span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">{selectedPodcast.description}</p>

                {/* If Owned Podcast: Episode Creator Controls */}
                {selectedPodcast.hostId === currentUserId && (
                  <Button
                    onClick={() => {
                      setEditingEpisode(null);
                      setEpisodeTitle('');
                      setEpisodeDesc('');
                      setEpisodeMediaFile(null);
                      setShowEpisodeModal(true);
                    }}
                    className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-xl font-bold gap-1.5"
                  >
                    <PlusCircle className="w-5 h-5" /> Thêm tập phát mới
                  </Button>
                )}
              </div>
            </div>

            {/* Episode List Section */}
            <div className="space-y-4 border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold">Các tập phát sóng</h2>
              
              {isLoadingEpisodes ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-xs">Đang tải tập phát sóng...</p>
                </div>
              ) : episodes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 italic">
                  Chưa có tập phát sóng nào được tải lên cho Podcast này.
                </div>
              ) : (
                <div className="space-y-3">
                  {episodes.map((episode, idx) => {
                    const isVideo = episode.mediaType?.includes('video') || (episode.mediaUrl || '').toLowerCase().endsWith('.mp4');
                    return (
                      <div 
                        key={episode.id}
                        className="p-5 rounded-2xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/40 hover:border-cyan-500/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                      >
                        <div className="flex gap-4 items-start flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 font-mono font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors truncate flex items-center gap-2">
                              {episode.title}
                              {isVideo ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-black tracking-wider">
                                  <Film className="w-3 h-3" /> MP4 Video
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-black tracking-wider">
                                  <FileAudio className="w-3 h-3" /> MP3 Audio
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2">{episode.description}</p>
                            <div className="flex gap-4 text-xs text-slate-400 mt-2 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-500" /> {episode.duration ? `${Math.floor(episode.duration / 1000 / 60)} phút` : 'Chưa cập nhật'}</span>
                              <span>•</span>
                              <span>Lượt nghe: {episode.playCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                          {/* Play button */}
                          <Button
                            onClick={() => handlePlayEpisode(episode)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-lg shadow-cyan-500/20"
                          >
                            <Play className="w-4.5 h-4.5 fill-black ml-0.5" />
                          </Button>

                          {/* Host modification controls */}
                          {selectedPodcast.hostId === currentUserId && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingEpisode(episode);
                                  setEpisodeTitle(episode.title);
                                  setEpisodeDesc(episode.description);
                                  setEpisodeMediaFile(null);
                                  setShowEpisodeModal(true);
                                }}
                                className="h-9 w-9 text-slate-400 hover:text-white rounded-full"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteEpisode(episode.id)}
                                className="h-9 w-9 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL: CREATE / UPDATE PODCAST ================= */}
        {showPodcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-6">
              <button 
                onClick={() => setShowPodcastModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div>
                <h3 className="text-xl font-black text-white">{editingPodcast ? 'Sửa Podcast' : 'Tạo Podcast Series mới'}</h3>
                <p className="text-xs text-slate-400 mt-1">Đăng tải các nội dung podcast định kỳ của bạn</p>
              </div>

              <form onSubmit={handlePodcastSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tiêu đề Podcast</Label>
                  <Input 
                    placeholder="VD: Chuyện Đêm Khuya..."
                    value={podcastTitle}
                    onChange={e => setPodcastTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Mô tả Podcast</Label>
                  <Textarea 
                    placeholder="Giới thiệu về nội dung series podcast này..."
                    rows={4}
                    value={podcastDesc}
                    onChange={e => setPodcastDesc(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Thể loại (phân cách bằng dấu phẩy)</Label>
                  <Input 
                    placeholder="VD: Công nghệ, Giáo dục, Giải trí"
                    value={podcastCategories}
                    onChange={e => setPodcastCategories(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Ảnh đại diện Podcast (Cover Image)</Label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setPodcastCover(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-2 cursor-pointer focus:outline-none focus:border-cyan-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPodcastModal(false)}
                    className="flex-1 rounded-xl text-slate-300 hover:text-white"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl"
                  >
                    Lưu thông tin
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: CREATE / UPDATE EPISODE ================= */}
        {showEpisodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-6">
              <button 
                onClick={() => setShowEpisodeModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div>
                <h3 className="text-xl font-black text-white">{editingEpisode ? 'Sửa Tập phát sóng' : 'Thêm Tập phát sóng mới'}</h3>
                <p className="text-xs text-slate-400 mt-1">Đăng tải nội dung âm thanh (MP3) hoặc video (MP4) vào series</p>
              </div>

              <form onSubmit={handleEpisodeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tiêu đề tập phát sóng</Label>
                  <Input 
                    placeholder="VD: Tập 1: Tương lai của AI..."
                    value={episodeTitle}
                    onChange={e => setEpisodeTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Mô tả tập phát sóng</Label>
                  <Textarea 
                    placeholder="Nhập nội dung ngắn gọn của tập phát sóng này..."
                    rows={4}
                    value={episodeDesc}
                    onChange={e => setEpisodeDesc(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <FileAudio className="w-4 h-4 text-cyan-400" /> Tải lên File Âm thanh (MP3) / Video (MP4)
                  </Label>
                  <input 
                    type="file" 
                    accept="audio/*,video/*"
                    onChange={e => setEpisodeMediaFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-2 cursor-pointer focus:outline-none focus:border-cyan-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400"
                  />
                  {editingEpisode && (
                    <p className="text-[10px] text-yellow-400 italic">Để trống nếu muốn giữ nguyên file media cũ.</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowEpisodeModal(false)}
                    className="flex-1 rounded-xl text-slate-300 hover:text-white"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl"
                  >
                    Tải lên & Lưu
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
