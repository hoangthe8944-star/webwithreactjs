import React, { useEffect, useState } from "react";
import { Play, Plus, Search, Grid, List, Music, User, Globe, Lock } from 'lucide-react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from './ui/button';
import PlaylistCover from './PlaylistCover'; // Import Component Grid ảnh

import {
  getPublicPlaylists,
  getUserPlaylists,
} from '../../api/playlistApi';
import type { PlaylistDto } from '../../api/playlistApi';

import type { Song } from '../../api/apiclient';

interface PlaylistsPageProps {
  currentUserId: string;
  isAdmin?: boolean;
  onPlaySong: (song: Song) => void;
  onCreateClick?: () => void;
  // Đồng bộ prop với App.tsx
  onPlaylistClick?: (playlist: any) => void; 
}

export function PlaylistsPage({ 
  currentUserId, 
  onPlaySong, 
  onCreateClick, 
  onPlaylistClick 
}: PlaylistsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [allPlaylists, setAllPlaylists] = useState<PlaylistDto[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredAll = allPlaylists
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'count') return (b.songCount || 0) - (a.songCount || 0);
      return 0;
    });

  const myPlaylists = userPlaylists.filter(p => p.ownerId === currentUserId);
  const publicPlaylists = filteredAll.filter(p => p.publicPlaylist);

  // ------------------------
  // Grid Item
  // ------------------------
  const PlaylistGridItem = ({ playlist }: { playlist: PlaylistDto }) => (
    <div 
      onClick={() => {alert("Đang mở playlist: " + playlist.name); onPlaylistClick?.(playlist)}} // Kích hoạt chuyển trang detail
      
      className="bg-white/5 backdrop-blur rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all cursor-pointer group flex flex-col h-full border border-white/5"
    >
      <div className="relative mb-3 sm:mb-4 aspect-square w-full">
        {/* ✅ SỬA LỖI 404: Dùng PlaylistCover và truyền songDetails */}
        <PlaylistCover 
          coverImage={playlist.coverImage} 
          tracks={playlist.songDetails || []} 
          name={playlist.name}
        />
        
        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg translate-y-1 group-hover:translate-y-0">
          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
        </div>
        {!playlist.publicPlaylist && (
          <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 backdrop-blur">
            <Lock className="w-3 h-3 text-white/70" />
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <h3 className="font-semibold text-white truncate mb-1">{playlist.name}</h3>
        <p className="text-xs text-white/50 line-clamp-2 h-8">{playlist.description || 'Không có mô tả'}</p>
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/40 mt-3 pt-3 border-t border-white/5">
        <span>{playlist.songCount || 0} bài hát</span>
        <span className="flex items-center gap-1">
          {playlist.ownerId === currentUserId ? <User className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {playlist.ownerName || 'User'}
        </span>
      </div>
    </div>
  );

  // ------------------------
  // List Item
  // ------------------------
  const PlaylistListItem = ({ playlist }: { playlist: PlaylistDto }) => (
    <div 
      onClick={() => onPlaylistClick?.(playlist)}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <PlaylistCover 
          coverImage={playlist.coverImage} 
          tracks={playlist.songDetails || []} 
          className="rounded-md shadow-lg"
        />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-white truncate text-base">{playlist.name}</h3>
          <p className="text-sm text-white/40 truncate">{playlist.description || 'Không có mô tả'}</p>
        </div>
        <div className="hidden md:flex items-center text-sm text-white/40 gap-6">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            {playlist.songCount || 0} bài hát
          </div>
          <div className="flex items-center gap-2">
            {playlist.ownerId === currentUserId ? <User className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {playlist.ownerName || 'User'}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-white/60">Đang tải thư viện...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-1">Thư viện Playlist</h2>
          <p className="text-white/50">Khám phá và quản lý các bộ sưu tập nhạc của bạn</p>
        </div>
        <Button onClick={onCreateClick} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
          <Plus className="w-4 h-4 mr-2" /> Tạo Playlist Mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Tìm trong playlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="name">Tên (A-Z)</SelectItem>
              <SelectItem value="count">Số lượng bài</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/40'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/40'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="mine">Của tôi</TabsTrigger>
          <TabsTrigger value="public">Công khai</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-1"}>
            {filteredAll.map(p => viewMode === 'grid' ? <PlaylistGridItem key={p.id} playlist={p} /> : <PlaylistListItem key={p.id} playlist={p} />)}
          </div>
        </TabsContent>

        <TabsContent value="mine">
           <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-1"}>
            {myPlaylists.map(p => viewMode === 'grid' ? <PlaylistGridItem key={p.id} playlist={p} /> : <PlaylistListItem key={p.id} playlist={p} />)}
          </div>
        </TabsContent>

        <TabsContent value="public">
           <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-1"}>
            {publicPlaylists.map(p => viewMode === 'grid' ? <PlaylistGridItem key={p.id} playlist={p} /> : <PlaylistListItem key={p.id} playlist={p} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}