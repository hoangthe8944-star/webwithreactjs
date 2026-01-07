import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { HomePage } from './components/HomePage';
import { LibraryPage } from './components/LibraryPage';
import { PlaylistsPage } from './components/PlaylistsPage';
import { SearchPage } from './components/SearchPage';
import { NowPlayingPage } from './components/NowPlayingPage';
import { ProfilePage } from './components/ProfilePage';
import { CreatePlaylistPage } from './components/CreatePlaylistPage';
import { LikedSongsPage } from './components/LikedSongsPage';
import { RecentlyPlayedPage } from './components/RecentlyPlayedPage';
import { PodcastPage } from './components/PodcastPage';
import { PlaylistDetailPage } from './components/PlaylistDetailPage';

import { VerifyPage } from './components/VerifyPage';
import { LoginSuccess } from './components/LoginSuccess';
import { recordPlayback } from '../api/apiclient';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { logout } from '../api/authapi';
import type { Song } from '../api/apiclient';
import './index.css';
import { Menu } from 'lucide-react';
import { ArtistPage, type Artist } from './components/ArtistPage';
import { PremiumModal } from './components/PremiumModal';

// Định nghĩa Type cho các trang để đồng bộ với Sidebar
export type PageType = 'home' | 'library' | 'playlists' | 'search' | 'nowplaying' | 'profile' | 'create-playlist' | 'liked-songs' | 'recently-played' | 'podcast' | 'playlist-detail' | 'artist-detail';

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  songCount: number;
  description?: string;
  owner?: string;
  updatedAt?: string;
  songs?: Song[];
}

export default function App() {
  // --- STATE QUẢN LÝ ---
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("accessToken"));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // State lưu playlist đang xem chi tiết
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  // --- THÔNG TIN USER ---
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const currentUserId = user?.id || "";
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  // --- STATE NHẠC ---
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);

  // ✅ 1. THEO DÕI URL HASH (GitHub Pages)
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ✅ 2. XỬ LÝ AUTH
  const handleAuthSuccess = (newToken: string) => {
    setToken(newToken);
    window.location.href = "/boxonline/";
  };

  const handleLogout = () => {
    logout();
    setToken(null);
    setCurrentSong(null);
    setIsPlaying(false);
    window.location.reload();
  };

  // ✅ 3. ĐIỀU HƯỚNG PLAYLIST
  const handleOpenPlaylist = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setCurrentPage('playlist-detail');
  };

  // ✅ 4. HÀM PHÁT NHẠC
  const handlePlaySong = (song: Song, contextPlaylist: Song[] = []) => {
    setCurrentSong(song);
    setIsPlaying(true);
    const newQueue = contextPlaylist.length > 0 ? contextPlaylist : [song];
    setPlayQueue(newQueue);
    const songIndex = newQueue.findIndex(s => s.id === song.id);
    setCurrentQueueIndex(songIndex !== -1 ? songIndex : 0);
    recordPlayback(song.id).catch(err => console.error("Playback record error:", err));
  };

  // --- RENDER TÁCH BIỆT ---
  if (currentHash.includes('/login-success')) return <LoginSuccess />;
  if (currentHash.includes('/verify')) return <VerifyPage />;

  if (!token) {
    const authBg = "flex items-center justify-center min-h-screen bg-slate-950 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-overlay";
    return (
      <div className={authBg}>
        <div className="w-full max-w-md p-4 animate-in fade-in duration-500">
          {authView === 'login' ? (
            <LoginForm onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterForm onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-700 via-cyan-600 to-cyan-400 text-white overflow-hidden">
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-900/80 backdrop-blur-lg lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onProfileClick={() => {
          setCurrentPage('profile');
          setIsSidebarOpen(false);
        }}
        onUpgradeClick={() => {
          setIsPremiumModalOpen(true);
          setIsSidebarOpen(false);
        }}
      />
      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={() => setCurrentPage('search')}
        />

        <main className="flex-1 overflow-y-auto pb-32">
          {currentPage === 'home' && <HomePage onPlaySong={handlePlaySong} onArtistClick={(artist) => {
            setSelectedArtist(artist);
            setCurrentPage('artist-detail');
          }} />}
          {currentPage === 'library' && <LibraryPage onPlaySong={handlePlaySong} />}
          {currentPage === 'search' && <SearchPage searchQuery={searchQuery} onPlaySong={handlePlaySong} />}

          {currentPage === 'playlists' && (
            <PlaylistsPage
              currentUserId={currentUserId}
              onPlaySong={handlePlaySong}
              onCreateClick={() => setCurrentPage('create-playlist')}
              onPlaylistClick={(playlist) => {
                setSelectedPlaylist(playlist);
                setCurrentPage('playlist-detail');
              }}
            />
          )}

          {currentPage === 'playlist-detail' && selectedPlaylist && (
            <PlaylistDetailPage
              playlist={selectedPlaylist}
              onBack={() => setCurrentPage('playlists')}
              onPlaySong={handlePlaySong}
            />
          )}

          {currentPage === 'profile' && <ProfilePage onLogout={handleLogout} />}
          {currentPage === 'liked-songs' && <LikedSongsPage onPlaySong={handlePlaySong} />}
          {currentPage === 'podcast' && (
            <PodcastPage
              onStartLive={() => alert("Chức năng Live Stream đang được phát triển!")}
            />
          )}
          {currentPage === 'recently-played' && <RecentlyPlayedPage onPlaySong={handlePlaySong} />}

          {currentPage === 'nowplaying' && (
            <NowPlayingPage
              currentSong={currentSong}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onPlaySong={handlePlaySong}
              currentTime={currentTime}
            />
          )}
          {currentPage === 'playlist-detail' && selectedPlaylist && (
            <PlaylistDetailPage
              playlist={selectedPlaylist}
              onBack={() => setCurrentPage('playlists')}
              onPlaySong={handlePlaySong}
            />
          )}
          {currentPage === 'artist-detail' && selectedArtist && (
            <ArtistPage
              artist={selectedArtist}
              onBack={() => setCurrentPage('home')}
              onPlaySong={handlePlaySong}
            />
          )}
          {currentPage === 'create-playlist' && (
            <CreatePlaylistPage
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onBack={() => setCurrentPage('playlists')}
              onCreated={() => setCurrentPage('playlists')}

            />
          )}
        </main>

        <MusicPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onClickPlayer={() => currentSong && setCurrentPage('nowplaying')}
          onNextSong={() => {
            const next = (currentQueueIndex + 1) % playQueue.length;
            handlePlaySong(playQueue[next], playQueue);
          }}
          onPrevSong={() => {
            const prev = (currentQueueIndex - 1 + playQueue.length) % playQueue.length;
            handlePlaySong(playQueue[prev], playQueue);
          }}
          onTimeUpdate={setCurrentTime}
        />
      </div>
    </div>
  );
}