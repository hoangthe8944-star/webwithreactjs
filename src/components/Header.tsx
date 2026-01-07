import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

export function Header({ searchQuery, onSearchChange, onSearch }: HeaderProps) {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-700/60 to-cyan-600/60 backdrop-blur-xl border-b border-cyan-500/30">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 pl-16 lg:pl-8">
        {/* Navigation Arrows - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <button className="p-2 rounded-full bg-blue-600/40 hover:bg-cyan-600/60 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-blue-600/40 hover:bg-cyan-600/60 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4 sm:mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <input
              type="text"
              placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-blue-700/60 border border-cyan-500/40 rounded-full text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
          </div>
        </form>
      </div>
    </header>
  );
}