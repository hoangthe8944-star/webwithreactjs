import {
  Play,
  Heart,
  Shuffle,
  ChevronDown,
  Equal,
  Pause,
  Music2
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Song } from '../../api/apiclient';
import { getTrendingSongs, getLyrics } from '../../api/apiclient';

/* ---------------- IMAGE FALLBACK ---------------- */
const ImageWithFallback = ({
  src,
  fallback,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: React.ReactNode }) => {
  const [error, setError] = useState(false);
  useEffect(() => setError(false), [src]);

  if (!src || error) {
    return (
      <div
        {...props}
        className={`${props.className} flex items-center justify-center bg-white/5`}
      >
        {fallback || <Music2 className="w-1/2 h-1/2 text-white/20" />}
      </div>
    );
  }

  return <img {...props} src={src} onError={() => setError(true)} />;
};

/* ---------------- PROPS ---------------- */
interface NowPlayingPageProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  onPlaySong: (song: Song, playlist: Song[]) => void;
  onTogglePlay: () => void;
}

/* ================= COMPONENT ================= */
export function NowPlayingPage({
  currentSong,
  isPlaying,
  currentTime,
  onPlaySong,
  onTogglePlay
}: NowPlayingPageProps) {
  const [liked, setLiked] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [upNext, setUpNext] = useState<Song[]>([]);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  /* ---------------- LOAD LYRICS (PLAIN) ---------------- */
  useEffect(() => {
    if (!currentSong) return;

    const fetchLyrics = async () => {
      setLoadingLyrics(true);
      try {
        const res = await getLyrics(
          currentSong.title,
          currentSong.artistName,
          currentSong.albumName,
          Math.floor(currentSong.duration / 1000)
        );

        const text =
          res.data.plainLyrics ||
          res.data.syncedLyrics ||
          'Chưa có lời bài hát';

        setLyrics(
          text
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean)
        );
      } catch {
        setLyrics(['Chưa có lời bài hát']);
      } finally {
        setLoadingLyrics(false);
      }
    };

    fetchLyrics();
  }, [currentSong?.id]);

  /* ---------------- FAKE KARAOKE INDEX ---------------- */
  const activeIndex = useMemo(() => {
    if (!currentSong || lyrics.length === 0) return -1;
    const progress =
      currentTime / (currentSong.duration / 1000);
    return Math.min(
      lyrics.length - 1,
      Math.floor(progress * lyrics.length)
    );
  }, [currentTime, lyrics, currentSong]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  /* ---------------- QUEUE ---------------- */
  useEffect(() => {
    if (!currentSong) return;
    getTrendingSongs(20).then(res => {
      setUpNext(
        res.data
          .filter(s => s.id !== currentSong.id)
          .sort(() => Math.random() - 0.5)
      );
    });
  }, [currentSong?.id]);

  if (!currentSong) return null;

  /* ================= UI ================= */
  return (
    <div className="h-full w-full overflow-hidden text-white">

      {/* ===== BACKGROUND LAYER (KHÔNG relative) ===== */}
      <div
        className="bg-blur-cover"
        style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-blue-950/70 to-black" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative h-full flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT */}
        <div className="relative z-10 flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-xl mx-auto flex flex-col items-center">

            {/* COVER */}
            <div className="w-72 h-72 mb-10">
              <ImageWithFallback
                src={currentSong.coverUrl}
                className="w-full h-full rounded-3xl shadow-2xl object-cover"
              />
            </div>

            {/* INFO */}
            <h2 className="text-3xl font-black mb-2 text-center truncate">
              {currentSong.title}
            </h2>
            <p className="text-cyan-400 text-xl mb-8">
              {currentSong.artistName}
            </p>

            {/* CONTROLS */}
            <div className="flex gap-6 mb-10">
              <button onClick={() => setLiked(!liked)}>
                <Heart
                  className={`w-8 h-8 ${liked ? 'text-red-500' : 'text-white/40'
                    }`}
                  fill={liked ? 'currentColor' : 'none'}
                />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button>
                <Shuffle className="w-6 h-6 text-white/40" />
              </button>
            </div>

            {/* LYRICS */}
            <div className="w-full bg-white/5 rounded-[40px] pl-8 pt-8 pr-8 backdrop-blur-md ">
              <h3 className="text-xs uppercase text-white/30 mb-6">
                Lyrics
              </h3>

              <div
                ref={scrollRef}
                className="h-[360px] overflow-y-auto space-y-8 pr-4"
              >
                {loadingLyrics ? (
                  <p className="text-center text-white/30">
                    Đang tải lời bài hát...
                  </p>
                ) : (
                  lyrics.map((line, i) => (
                    <p
                      key={i}
                      ref={i === activeIndex ? activeRef : null}
                      className={`text-2xl sm:text-3xl font-black transition-all duration-500 ${i === activeIndex
                        ? 'text-white scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                        : 'text-white/20'
                        }`}
                    >
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        {/* QUEUE */}
        <div
          className={`fixed lg:static bottom-0 left-0 right-0 lg:w-96 bg-black/40 backdrop-blur-2xl transition-transform duration-500 z-20 ${queueOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
            }`}
        >
          <div className="p-6 border-b border-white/10 flex justify-between">
            <h3 className="font-bold">Tiếp theo</h3>
            <button
              className="lg:hidden"
              onClick={() => setQueueOpen(false)}
            >
              <ChevronDown />
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
            {upNext.map((s, i) => (
              <button
                key={s.id}
                onClick={() => onPlaySong(s, upNext)}
                className="w-full flex gap-4 p-3 rounded-3xl hover:bg-white/10"
              >
                <span className="text-white/20 text-xs">{i + 1}</span>
                <ImageWithFallback
                  src={s.coverUrl}
                  className="w-14 h-14 rounded-2xl"
                />
                <div className="text-left">
                  <p className="font-bold truncate">{s.title}</p>
                  <p className="text-xs text-white/40 truncate">
                    {s.artistName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {!queueOpen && (
          <button
            onClick={() => setQueueOpen(true)}
            className="lg:hidden fixed bottom-28 right-8 p-5 bg-white text-black rounded-full shadow-xl z-30"
          >
            <Equal />
          </button>
        )}
      </div>
    </div>
  );
}
