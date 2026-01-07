import { Home, Library, ListMusic, Search, Heart, Clock, User, Crown, Mic } from 'lucide-react';

interface SidebarProps {
  currentPage: 'home' | 'library' | 'playlists' | 'search' | 'nowplaying' | 'profile' | 'create-playlist' | 'liked-songs' | 'recently-played' | 'podcast' | 'playlist-detail' | 'artist-detail';
  onNavigate: (page: 'home' | 'library' | 'playlists' | 'search' | 'nowplaying' | 'profile' | 'create-playlist' | 'liked-songs' | 'recently-played' | 'podcast') => void;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onUpgradeClick?: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose, onProfileClick, onUpgradeClick }: SidebarProps) {
  const menuItems = [
    { id: 'home' as const, label: 'Trang chủ', icon: Home },
    { id: 'search' as const, label: 'Tìm kiếm', icon: Search },
    { id: 'library' as const, label: 'Thư viện', icon: Library },
    { id: 'podcast' as const, label: 'Podcast', icon: Mic },
  ];

  const libraryItems = [
    { id: 'playlists' as const, label: 'Playlists', icon: ListMusic },
    { id: 'liked-songs' as const, label: 'Bài hát yêu thích', icon: Heart },
    { id: 'recently-played' as const, label: 'Đã phát gần đây', icon: Clock },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-40
      w-64 bg-gradient-to-b from-blue-950/80 to-blue-900/60 backdrop-blur-lg border-r border-blue-700/30 flex flex-col
      transform transition-transform duration-300 lg:transform-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          MusicStream
        </h1>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'text-blue-200 hover:text-white hover:bg-blue-800/30'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Library Section */}
        <div className="mt-8">
          <h2 className="px-4 mb-3 text-sm text-blue-300 uppercase tracking-wider">
            Thư viện của bạn
          </h2>
          <div className="space-y-1">
            {libraryItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = 'id' in item && currentPage === item.id;
              return (
                <button
                  key={index}
                  onClick={() => 'id' in item && onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300'
                      : 'text-blue-200 hover:text-white hover:bg-blue-800/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section - Premium & User Info */}
      <div className="p-4 border-t border-blue-700/30 space-y-3">
        {/* Premium Button */}
        <button 
          onClick={onUpgradeClick}
          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5" />
          <span>Nâng cấp Premium</span>
        </button>

        {/* User Profile Button */}
        <button
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800/30 hover:bg-blue-700/40 transition-all"
        >
          <div className="p-2 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500">
            <User className="w-5 h-5" />
          </div>
          <span>Tài khoản của tôi</span>
        </button>
      </div>
    </aside>
  );
}
