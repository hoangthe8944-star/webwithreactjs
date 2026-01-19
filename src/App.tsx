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
import { recordSongPlay } from '../api/apiclient';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { logout } from '../api/authapi';
import type { Song } from '../api/apiclient';
import './index.css';
import { Menu } from 'lucide-react';
import { ArtistPage, type Artist } from './components/ArtistPage';
import { PremiumModal } from './components/PremiumModal';


export type PageType = 'home' | 'library' | 'playlists' | 'search' | 'nowplaying' | 'profile' | 'create-playlist' | 'liked-songs' | 'recently-played' | 'podcast' | 'playlist-detail' | 'artist-detail';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("accessToken"));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const currentUserId = user?.id || "";
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [previousPage, setPreviousPage] = useState<'home' | 'playlists'>('home');

  const [currentHash, setCurrentHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthSuccess = (newToken: string) => {
    setToken(newToken);
    window.location.href = "/boxonline/";
  };

  const handleLogout = () => {
    logout();
    setToken(null);
    window.location.reload();
  };

  // ✅ HÀM MỞ PLAYLIST (ĐÃ SỬA)

  const handlePlaySong = (song: Song, contextPlaylist: Song[] = []) => {
    console.log("Đang gửi ID người dùng đi:", currentUserId);
    setCurrentSong(song);
    setIsPlaying(true);
    const newQueue = contextPlaylist.length > 0 ? contextPlaylist : [song];
    setPlayQueue(newQueue);
    const songIndex = newQueue.findIndex(s => s.id === song.id);
    setCurrentQueueIndex(songIndex !== -1 ? songIndex : 0);
    recordSongPlay(song.id, currentUserId).catch(err => console.error("Playback record error:", err));
  };

  if (currentHash.includes('/login-success')) return <LoginSuccess />;
  if (currentHash.includes('/verify')) return <VerifyPage />;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-full max-w-md p-4">
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
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />

      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-900/80 lg:hidden">
        <Menu className="w-6 h-6" />
      </button>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setIsSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onProfileClick={() => { setCurrentPage('profile'); setIsSidebarOpen(false); }}
        onUpgradeClick={() => { setIsPremiumModalOpen(true); setIsSidebarOpen(false); }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearch={() => setCurrentPage('search')} />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* TRANG CHỦ */}
          {currentPage === 'home' && (
            <HomePage
              onPlaySong={handlePlaySong}
              onArtistClick={(artist) => {
                setSelectedArtist(artist);
                setCurrentPage('artist-detail');
              }}
              onPlaylistClick={(playlist) => {
                setSelectedPlaylist(playlist);
                setPreviousPage('home');
                setCurrentPage('playlist-detail');
              }}
            />
          )}
          {/* TRANG TÌM KIẾM */}
          {currentPage === 'search' && <SearchPage searchQuery={searchQuery} onPlaySong={handlePlaySong} />}

          {/* TRANG DANH SÁCH PLAYLIST */}
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
          {/* TRANG CHI TIẾT PLAYLIST */}
          {currentPage === 'playlist-detail' && selectedPlaylist && (
            <PlaylistDetailPage
              playlist={selectedPlaylist}
              onBack={() => setCurrentPage('playlists')}
              onPlaySong={handlePlaySong}
            />
          )}
          {/* CÁC TRANG KHÁC */}
          {currentPage === 'profile' && <ProfilePage onLogout={handleLogout} />}
          {currentPage === 'library' && <LibraryPage onPlaySong={handlePlaySong} />}
          {currentPage === 'liked-songs' && <LikedSongsPage onPlaySong={handlePlaySong} />}
          {currentPage === 'recently-played' && <RecentlyPlayedPage onPlaySong={handlePlaySong} currentUserId={currentUserId} />}
          {currentPage === 'podcast' && <PodcastPage onStartLive={() => alert("Đang phát triển!")} />}
          {currentPage === 'artist-detail' && selectedArtist && (
            <ArtistPage artist={selectedArtist} onBack={() => setCurrentPage('home')} onPlaySong={handlePlaySong} />
          )}
          {currentPage === 'create-playlist' && (
            <CreatePlaylistPage currentUserId={currentUserId} isAdmin={isAdmin} onBack={() => setCurrentPage('playlists')} onCreated={() => setCurrentPage('playlists')} />
          )}
          {currentPage === 'nowplaying' && (
            <NowPlayingPage currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} onPlaySong={handlePlaySong} currentTime={currentTime} />
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