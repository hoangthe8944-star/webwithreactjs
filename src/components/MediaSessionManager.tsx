import { useEffect } from 'react';
import type { Song } from '../../api/apiclient';

interface MediaSessionProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>; // Giữ optional để linh hoạt
}

export default function MediaSessionManager({
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  audioRef,
}: MediaSessionProps) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Guard sớm: nếu audioRef không tồn tại → thoát useEffect luôn
    if (!audioRef) return;

    const mediaSession = navigator.mediaSession;

    // Metadata
    if (currentSong) {
      mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artistName || 'Unknown Artist',
        album: currentSong.albumName || 'BeatBox',
        artwork: [
          { src: currentSong.coverUrl, sizes: '96x96', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '128x128', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '192x192', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '256x256', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '384x384', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '512x512', type: 'image/png' },
        ],
      });
    } else {
      mediaSession.metadata = null;
    }

    mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Action handlers
    mediaSession.setActionHandler('play', onPlay);
    mediaSession.setActionHandler('pause', onPause);
    mediaSession.setActionHandler('nexttrack', onNext);
    mediaSession.setActionHandler('previoustrack', onPrev);

    // Seek handlers
    mediaSession.setActionHandler('seekto', (details) => {
      const audio = audioRef.current;
      if (audio && !isNaN(audio.duration)) {
        const seekTime = details.seekTime ?? 0;
        audio.currentTime = Math.max(0, Math.min(seekTime, audio.duration));
      }
    });

    mediaSession.setActionHandler('seekforward', (details) => {
      const audio = audioRef.current;
      if (audio && !isNaN(audio.duration)) {
        const offset = details.seekOffset ?? 10;
        audio.currentTime = Math.min(audio.currentTime + offset, audio.duration);
      }
    });

    mediaSession.setActionHandler('seekbackward', (details) => {
      const audio = audioRef.current;
      if (audio && !isNaN(audio.duration)) {
        const offset = details.seekOffset ?? 10;
        audio.currentTime = Math.max(audio.currentTime - offset, 0);
      }
    });

    // Update position function
    const updatePositionState = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isNaN(audio.duration) || audio.duration === Infinity || audio.duration <= 0) {
        return;
      }

      if ('setPositionState' in mediaSession) {
        try {
          mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(audio.currentTime, audio.duration),
          });
        } catch (err) {
          console.warn('setPositionState failed:', err);
        }
      }
    };

    const events = ['timeupdate', 'seeked', 'play', 'pause', 'loadedmetadata', 'durationchange'];

    events.forEach((event) => {
      audioRef.current?.addEventListener(event, updatePositionState);
    });

    updatePositionState();

    return () => {
      mediaSession.setActionHandler('play', null);
      mediaSession.setActionHandler('pause', null);
      mediaSession.setActionHandler('nexttrack', null);
      mediaSession.setActionHandler('previoustrack', null);
      mediaSession.setActionHandler('seekto', null);
      mediaSession.setActionHandler('seekforward', null);
      mediaSession.setActionHandler('seekbackward', null);

      events.forEach((event) => {
        audioRef.current?.removeEventListener(event, updatePositionState);
      });
    };
  }, [currentSong, isPlaying, onPlay, onPause, onNext, onPrev, audioRef]);

  return null;
}