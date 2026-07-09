import React, { useState, useEffect, useRef } from "react";
import { toast } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { HomePage } from './components/HomePage';
import { LibraryPage } from './components/LibraryPage';
import { PlaylistsPage } from './components/PlaylistsPage';
import { SearchPage } from './components/SearchPage';
import { NowPlayingPage } from './components/NowPlayingPage';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { ProfilePage } from './components/ProfilePage';
import { CreatePlaylistPage } from './components/CreatePlaylistPage';
import { LikedSongsPage } from './components/LikedSongsPage';
import { RecentlyPlayedPage } from './components/RecentlyPlayedPage';
import { PodcastPage } from './components/PodcastPage';
import { PlaylistDetailPage } from './components/PlaylistDetailPage';
import { GenreDetailPage } from './components/GenreDetailPage';
import { VerifyPage } from './components/VerifyPage';
import { LoginSuccess } from './components/LoginSuccess';
import { recordSongPlay, checkPlayback } from '../api/apiclient';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { logout } from '../api/authapi';
import type { Song } from '../api/apiclient';
import './index.css';
import { Menu } from 'lucide-react';
import type { Artist } from '../api/artistApi';
import { ArtistPage } from './components/ArtistPage';
import { PremiumModal } from './components/PremiumModal';
import { PaymentPage } from './components/PaymentPage';
import { PremiumPage } from './components/PremiumPage';
import { getPremiumStatus } from '../api/premiumApi';
import type { PremiumStatusResponse } from '../api/premiumApi';

import './live.css';
import { liveApi } from '../api/liveApi';
import ZegoPlayer from "./components/ZegoPlayer";
import AIChatbox from './components/AIChatbox';
import MediaSessionManager from './components/MediaSessionManager';
import { FollowingArtistsPage } from "./components/FollowingArtistsPage";
const AIChatboxAny: any = AIChatbox;

export type PageType = 'home' | 'library' | 'playlists' | 'search' | 'nowplaying' | 'profile' | 'create-playlist' | 'liked-songs' | 'recently-played' | 'podcast' | 'playlist-detail' | 'artist-detail' | 'live-detail' | 'auth' | 'premium' | 'genre-detail' | 'verify' | 'login-success' | 'login' | 'register' | 'artist' | 'payment' | 'following-artists';

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("accessToken"));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<any>(null);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [pendingSong, setPendingSong] = useState<Song | null>(null);
  const [pendingQueue, setPendingQueue] = useState<Song[]>([]);

  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    try {
      const getCookie = (name: string): string | null => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      };
      const saved = getCookie('liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleToggleLikeSong = (song: Song) => {
    setLikedSongs(prev => {
      let updated;
      const isAlreadyLiked = prev.some(s => s.id === song.id);
      if (isAlreadyLiked) {
        updated = prev.filter(s => s.id !== song.id);
        toast.info(`Đã bỏ thích bài hát "${song.title}"`);
      } else {
        updated = [...prev, song];
        toast.success(`Đã thêm bài hát "${song.title}" vào mục Yêu thích`);
      }
      const d = new Date();
      d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      document.cookie = "liked_songs=" + JSON.stringify(updated) + ";" + expires + ";path=/";
      return updated;
    });
  };

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const currentUserId = user?.id || "";
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);

  const fetchPremiumStatus = async () => {
    if (!token) {
      setIsPremium(false);
      setPremiumStatus(null);
      return;
    }
    try {
      const res = await getPremiumStatus();
      if (res.data) {
        setIsPremium(res.data.isPremium || res.data.premium || res.data.active || false);
        setPremiumStatus(res.data);
      }
    } catch (err) {
      console.error("Error checking premium status:", err);
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, [token]);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [liveRoomId, setLiveRoomId] = useState<string | null>(null);
  const [isLiveHost, setIsLiveHost] = useState(false);
  const [liveSessionTitle, setLiveSessionTitle] = useState('');
  const [isNowPlayingFullScreen, setIsNowPlayingFullScreen] = useState(false);

  const [currentHash, setCurrentHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthSuccess = (newToken: string, userData: any) => {
    sessionStorage.setItem("accessToken", newToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setCurrentPage('home'); 
  };

  const handleLogout = () => {
    logout();
    setToken(null);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setCurrentPage('home');
  };

  const navigateToAuth = () => {
    setAuthView('login');
    setCurrentPage('auth');
  };

  const handlePlaySong = async (song: Song, contextPlaylist: Song[] = [], bypassAdCheck = false) => {
    if (!token) {
      navigateToAuth();
      return;
    }
    if (!song.streamUrl) {
      toast.error("Bài hát này chưa có file âm thanh khả dụng!");
      return;
    }
    if (!bypassAdCheck && isAdPlaying && song.albumName !== "Quảng cáo tài trợ") {
      alert("Vui lòng đợi quảng cáo kết thúc!");
      return;
    }
    if (song.albumName === "Quảng cáo tài trợ") {
      setCurrentSong(song);
      setIsPlaying(true);
      setPlayQueue([song]);
      setCurrentQueueIndex(0);
      return;
    }
    if (!bypassAdCheck && !isPremium) {
      try {
        const checkRes = await checkPlayback({
          currentSongId: song.id,
          isPlaying: false,
          songProgressSeconds: 0,
          songDurationSeconds: 0
        });
        if (checkRes.data && checkRes.data.action === "PLAY_AD" && checkRes.data.ad) {
          const ad = checkRes.data.ad;
          const adSong: Song = {
            id: ad.id,
            title: "[Quảng cáo] " + ad.title,
            artistName: ad.partnerName,
            albumName: "Quảng cáo tài trợ",
            coverUrl: ad.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            duration: ad.duration,
            streamUrl: ad.audioUrl || "",
            status: 'PUBLISHED',
            viewCount: 0,
            isExplicit: false,
            genre: []
          };
          setIsAdPlaying(true);
          setPendingSong(song);
          setPendingQueue(contextPlaylist);
          setCurrentSong(adSong);
          setIsPlaying(true);
          setPlayQueue([adSong]);
          setCurrentQueueIndex(0);
          return;
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra Playback ad:", err);
      }
    } else {
      setIsAdPlaying(false);
    }
    setCurrentSong(song);
    setIsPlaying(true);
    const newQueue = contextPlaylist.length > 0 ? contextPlaylist : [song];
    setPlayQueue(newQueue);
    const songIndex = newQueue.findIndex(s => s.id === song.id);
    setCurrentQueueIndex(songIndex !== -1 ? songIndex : 0);
    recordSongPlay(song.id, currentUserId).catch(err => console.error("Playback record error:", err));
  };

  const handleJoinLive = (roomId: string, isHost: boolean) => {
    setLiveRoomId(roomId);
    setIsLiveHost(isHost);
    setLiveSessionTitle('Live podcast');
    setCurrentPage('live-detail');
  };

  const handleLeaveLive = async () => {
    if (isLiveHost && liveRoomId) {
      try {
        await liveApi.endLive(liveRoomId);
      } catch (err) {
        console.error("Lỗi kết thúc live:", err);
      }
    }
    setLiveRoomId(null);
    setIsLiveHost(false);
    setLiveSessionTitle('');
    setCurrentPage('podcast');
  };

  if (currentHash.includes('/login-success')) return <LoginSuccess />;
  if (currentHash.includes('/verify')) return <VerifyPage />;

  const handleNextMedia = () => {
    if (playQueue.length > 0) {
      const nextIndex = (currentQueueIndex + 1) % playQueue.length;
      handlePlaySong(playQueue[nextIndex], playQueue);
    }
  };

  const handlePrevMedia = () => {
    if (playQueue.length > 0) {
      const prevIndex = (currentQueueIndex - 1 + playQueue.length) % playQueue.length;
      handlePlaySong(playQueue[prevIndex], playQueue);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-700 via-cyan-600 to-cyan-400 text-white overflow-hidden">
      {isNowPlayingFullScreen && currentSong ? (
        <FullScreenPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={() => {
            if (!token) {
              navigateToAuth();
              return;
            }
            setIsPlaying(!isPlaying);
          }}
          onNextSong={handleNextMedia}
          onPrevSong={handlePrevMedia}
          onClose={() => setIsNowPlayingFullScreen(false)}
          volume={volume}
          onVolumeChange={setVolume}
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
        />
      ) : (
        <>
          <PremiumModal
            isOpen={isPremiumModalOpen}
            onClose={() => setIsPremiumModalOpen(false)}
            onSelectPackage={(pkg) => {
              setSelectedPackageForPayment(pkg);
              setCurrentPage('premium');
            }}
          />

          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-900/80 lg:hidden">
            <Menu className="w-6 h-6" />
          </button>

          {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

          <Sidebar
            currentPage={currentPage}
            onNavigate={(page: any) => {
              setCurrentPage(page as PageType);
              setIsSidebarOpen(false);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onProfileClick={() => {
              if (token) {
                setCurrentPage('profile');
              } else {
                navigateToAuth();
              }
              setIsSidebarOpen(false);
            }}
            onUpgradeClick={() => { setIsPremiumModalOpen(true); setIsSidebarOpen(false); }}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearch={() => setCurrentPage('search')} />

            <main className="flex-1 overflow-y-auto pb-32">
              {currentPage === 'home' && (
                <HomePage
                  onPlaySong={handlePlaySong}
                  onArtistClick={(artist) => {
                    setSelectedArtist(artist);
                    setCurrentPage('artist-detail');
                  }}
                  onPlaylistClick={(playlist) => {
                    setSelectedPlaylist(playlist);
                    setCurrentPage('playlist-detail');
                  }}
                  onGenreClick={(genre) => {
                    setSearchQuery(genre);
                    setCurrentPage('search');
                  }}
                />
              )}
              {currentPage === 'auth' && (
                <div className="flex items-center justify-center min-h-full bg-slate-950/40 px-4 py-8">
                  <div className="w-full max-w-md">
                    {authView === 'login' ? (
                      <LoginForm
                        onLoginSuccess={(token, user) => handleAuthSuccess(token, user)}
                        onSwitchToRegister={() => setAuthView('register')}
                      />
                    ) : (
                      <RegisterForm
                        onRegisterSuccess={(token, user) => handleAuthSuccess(token, user)}
                        onSwitchToLogin={() => setAuthView('login')}
                      />
                    )}
                  </div>
                </div>
              )}
              {currentPage === 'search' && (
                <SearchPage
                  searchQuery={searchQuery}
                  onPlaySong={handlePlaySong}
                  onArtistClick={(artist) => {
                    setSelectedArtist(artist);
                    setCurrentPage('artist-detail');
                  }}
                  onPlaylistClick={(playlist) => {
                    setSelectedPlaylist(playlist);
                    setCurrentPage('playlist-detail');
                  }}
                />
              )}
              {currentPage === 'playlists' && (
                <PlaylistsPage
                  currentUserId={currentUserId}
                  onPlaySong={handlePlaySong}
                  onCreateClick={() => setCurrentPage('create-playlist')}
                  onPlaylistClick={(playlist) => {
                    setSelectedPlaylist(playlist);
                    setCurrentPage('playlist-detail');
                  }} />
              )}
              {currentPage === 'playlist-detail' && selectedPlaylist && (
                <PlaylistDetailPage
                  playlist={selectedPlaylist}
                  onBack={() => setCurrentPage('playlists')}
                  onPlaySong={handlePlaySong}
                />
              )}
              {currentPage === 'profile' && token && <ProfilePage onLogout={handleLogout} />}
              {currentPage === 'library' && <LibraryPage likedSongs={likedSongs} onPlaySong={handlePlaySong} onNavigate={(page) => setCurrentPage(page as PageType)} />}
              {currentPage === 'liked-songs' && <LikedSongsPage likedSongs={likedSongs} onPlaySong={handlePlaySong} />}
              {currentPage === 'recently-played' && <RecentlyPlayedPage onPlaySong={handlePlaySong} currentUserId={currentUserId} />}
              {currentPage === 'podcast' && (
                <PodcastPage
                  currentUserId={currentUserId}
                  onPlaySong={handlePlaySong}
                  onJoinLiveRoom={handleJoinLive}
                />
              )}
              {currentPage === 'artist-detail' && selectedArtist && (
                <ArtistPage artist={selectedArtist} onBack={() => setCurrentPage('home')} onPlaySong={handlePlaySong} />
              )}
              {currentPage === 'genre-detail' && selectedGenre && (
                <GenreDetailPage
                  genreName={selectedGenre}
                  onBack={() => setCurrentPage('home')}
                  onArtistClick={(artist) => {
                    setSelectedArtist(artist);
                    setCurrentPage('artist-detail');
                  }}
                  onPlaySong={handlePlaySong}
                />
              )}
              {currentPage === 'create-playlist' && (
                <CreatePlaylistPage currentUserId={currentUserId} isAdmin={isAdmin} onBack={() => setCurrentPage('playlists')} onCreated={() => setCurrentPage('playlists')} />
              )}
              {currentPage === 'nowplaying' && (
                <NowPlayingPage
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onTogglePlay={() => {
                    if (!token) {
                      navigateToAuth();
                      return;
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  onPlaySong={handlePlaySong}
                  currentTime={currentTime}
                  isPremium={isPremium}
                  premiumStatus={premiumStatus}
                />
              )}
              {currentPage === 'live-detail' && liveRoomId && (
                <ZegoPlayer
                  roomId={liveRoomId}
                  userId={user?.id?.toString() || `guest-${Date.now()}`}
                  userName={user?.username || `Guest ${Math.floor(Math.random() * 1000)}`}
                  isHost={isLiveHost}
                  liveTitle={liveSessionTitle}
                  mode="podcast"
                  onLeave={handleLeaveLive}
                />
              )}
              {currentPage === 'premium' && selectedPackageForPayment && (
                <PaymentPage
                  selectedPackage={selectedPackageForPayment}
                  onCancel={() => {
                    setSelectedPackageForPayment(null);
                    setCurrentPage('home');
                  }}
                  onPaymentSuccess={() => {
                    setSelectedPackageForPayment(null);
                    fetchPremiumStatus();
                    setIsPremiumModalOpen(true);
                  }}
                />
              )}
              {currentPage === 'following-artists' && (
                <FollowingArtistsPage
                  onOpenArtist={(artist) => {
                    setSelectedArtist(artist);
                    setCurrentPage("artist-detail");
                  }}
                />
              )}
            </main>
            <AIChatboxAny user={user} />
            <MediaSessionManager
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onNext={handleNextMedia}
              onPrev={handlePrevMedia}
              audioRef={audioRef as React.RefObject<HTMLAudioElement>}
            />
            <MusicPlayer
              currentSong={currentSong}
              isPlaying={isPlaying}
              isPremium={isPremium}
              premiumStatus={premiumStatus}
              likedSongs={likedSongs}
              onToggleLike={handleToggleLikeSong}
              onTogglePlay={() => {
                if (!token) {
                  navigateToAuth();
                  return;
                }
                setIsPlaying(!isPlaying);
              }}
              onClickPlayer={() => currentSong && setCurrentPage('nowplaying')}
              onNextSong={() => {
                if (isAdPlaying && pendingSong) {
                  setIsAdPlaying(false);
                  const songToPlay = pendingSong;
                  const queueToPlay = pendingQueue;
                  setPendingSong(null);
                  setPendingQueue([]);
                  handlePlaySong(songToPlay, queueToPlay, true);
                } else {
                  const next = (currentQueueIndex + 1) % playQueue.length;
                  handlePlaySong(playQueue[next], playQueue);
                }
              }}
              onPrevSong={() => {
                if (isAdPlaying) return;
                const prev = (currentQueueIndex - 1 + playQueue.length) % playQueue.length;
                handlePlaySong(playQueue[prev], playQueue);
              }}
              onTimeUpdate={setCurrentTime}
              onFullScreen={() => setIsNowPlayingFullScreen(true)}
              volume={volume}
              setVolume={setVolume}
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
            />
          </div>
        </>
      )}
    </div>
  );
}