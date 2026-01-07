import React, { useEffect, useState } from "react";
import { Play, Plus, Search, Grid, List, Music, User, Globe, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from './ui/button';

import {
  getPublicPlaylists,
  getUserPlaylists,
  addTrackToPlaylist,
} from '../../api/playlistApi';
import type { PlaylistDto } from '../../api/playlistApi';

import type { Song } from '../../api/apiclient';
import type { Playlist } from '../App';

interface PlaylistsPageProps {
  currentUserId: string;
  isAdmin?: boolean;
  onPlaySong: (song: Song) => void;
  onCreateClick?: () => void;
    onPlaylistClick?: (playlist: Playlist & { owner?: string; description?: string; updatedAt?: string }) => void;

}

export function PlaylistsPage({ currentUserId, isAdmin = false, onPlaySong, onCreateClick }: PlaylistsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [allPlaylists, setAllPlaylists] = useState<PlaylistDto[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------
  // Fetch playlists from backend
  // ------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const publicData = await getPublicPlaylists();
        const userData = await getUserPlaylists(currentUserId);

        setAllPlaylists(publicData);
        setUserPlaylists(userData);
      } catch (err) {
        console.error("Failed to fetch playlists", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  // ------------------------
  // Filter + Sort
  // ------------------------
  const filteredAll = allPlaylists
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.id).getTime() - new Date(a.id).getTime(); // dùng id timestamp thay updatedAt
      if (sortBy === 'count') return b.tracks.length - a.tracks.length;
      return 0;
    });

  const myPlaylists = userPlaylists.filter(p => p.ownerId === currentUserId);
  const publicPlaylists = filteredAll.filter(p => p.publicPlaylist);

  // ------------------------
  // Grid/List item components
  // ------------------------
  const PlaylistGridItem = ({ playlist }: { playlist: PlaylistDto }) => (
    <div className="bg-gradient-to-b from-blue-900/30 to-transparent backdrop-blur rounded-lg p-3 sm:p-4 hover:bg-blue-800/40 transition-all cursor-pointer group flex flex-col h-full">
      <div className="relative mb-3 sm:mb-4 aspect-square w-full">
        <ImageWithFallback src={playlist.tracks[0] || ''} alt={playlist.name} className="w-full h-full object-cover rounded-lg shadow-xl" />
        <div className="absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg shadow-cyan-500/30">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="white" />
        </div>
        {!playlist.publicPlaylist && playlist.ownerId === currentUserId && (
          <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 backdrop-blur">
            <Lock className="w-3 h-3 text-white/70" />
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <h3 className="font-semibold text-white truncate mb-1">{playlist.name}</h3>
        <p className="text-sm text-blue-200 line-clamp-2 mb-2 h-10">{playlist.description}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-blue-300 mt-2 pt-3 border-t border-white/5">
        <span>{playlist.tracks.length} songs</span>
        <span className="flex items-center gap-1">
          {playlist.ownerId === currentUserId ? <User className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {playlist.ownerId}
        </span>
      </div>
    </div>
  );

  const PlaylistListItem = ({ playlist }: { playlist: PlaylistDto }) => (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
        <ImageWithFallback src={playlist.tracks[0] || ''} alt={playlist.name} className="w-full h-full object-cover rounded-md shadow-lg" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity rounded-md">
          <Play className="w-6 h-6 text-white" fill="white" />
        </div>
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-white truncate text-base sm:text-lg">{playlist.name}</h3>
          <p className="text-sm text-blue-200 truncate">{playlist.description}</p>
        </div>
        <div className="hidden md:flex items-center text-sm text-blue-300 gap-6">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            {playlist.tracks.length} bài hát
          </div>
          <div className="flex items-center gap-2">
            {playlist.ownerId === currentUserId ? <User className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {playlist.ownerId}
          </div>
        </div>
      </div>
    </div>
  );

  // ------------------------
  // Render
  // ------------------------
  if (loading) return <div className="text-white">Đang tải playlist...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">Thư viện Playlist</h2>
            <p className="text-blue-300">Quản lý và khám phá các bộ sưu tập nhạc của bạn</p>
          </div>
          <Button onClick={onCreateClick} className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium shadow-lg shadow-cyan-500/20">
            <Plus className="w-4 h-4 mr-2" /> Tạo Playlist Mới
          </Button>
        </div>
        {/* Toolbar */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
            <Input
              placeholder="Tìm kiếm playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-blue-300/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-black/20 border-white/10 text-blue-200">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent className="bg-blue-950 border-blue-800 text-blue-100">
                <SelectItem value="name">Tên (A-Z)</SelectItem>
                <SelectItem value="date">Mới nhất</SelectItem>
                <SelectItem value="count">Số lượng bài hát</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-black shadow-sm' : 'text-blue-300 hover:text-white'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-black shadow-sm' : 'text-blue-300 hover:text-white'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-blue-300">Tất cả</TabsTrigger>
          <TabsTrigger value="mine" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-blue-300">Của tôi</TabsTrigger>
          <TabsTrigger value="public" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-blue-300">Công khai</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAll.map(playlist => <PlaylistGridItem key={playlist.id} playlist={playlist} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAll.map(playlist => <PlaylistListItem key={playlist.id} playlist={playlist} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {myPlaylists.map(playlist => <PlaylistGridItem key={playlist.id} playlist={playlist} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {myPlaylists.map(playlist => <PlaylistListItem key={playlist.id} playlist={playlist} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {publicPlaylists.map(playlist => <PlaylistGridItem key={playlist.id} playlist={playlist} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {publicPlaylists.map(playlist => <PlaylistListItem key={playlist.id} playlist={playlist} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
