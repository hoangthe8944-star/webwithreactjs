import { useEffect } from 'react';
// Import interface Song từ file api của bạn để đồng bộ dữ liệu
import type { Song } from '../../api/apiclient'; 

interface MediaSessionProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function MediaSessionManager({
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev
}: MediaSessionProps) {
  
  useEffect(() => {
    // 1. Kiểm tra trình duyệt có hỗ trợ Media Session API không
    if (!('mediaSession' in navigator)) return;

    if (currentSong) {
      // 2. Cập nhật Metadata khớp với interface Song của bạn
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artistName, // Khớp với artistName trong interface
        album: currentSong.albumName || 'BeatBox Album', // Khớp với albumName
        artwork: [
          { src: currentSong.coverUrl, sizes: '96x96', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '128x128', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '256x256', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '384x384', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '512x512', type: 'image/png' },
        ],
      });
    }

    // 3. Cập nhật trạng thái Play/Pause trên thông báo
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // 4. Cài đặt các trình điều khiển (Action Handlers)
    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);
    navigator.mediaSession.setActionHandler('previoustrack', onPrev);

    // Cleanup khi component bị gỡ bỏ hoặc thay đổi
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, [currentSong, isPlaying, onPlay, onPause, onNext, onPrev]);

  return null; // Component này chạy ngầm, không render UI
}