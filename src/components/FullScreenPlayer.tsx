import {
  Crown,
  Gauge,
  Heart,
  Loader2,
  Minimize2,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Song } from "../../api/apiclient";
import "./FullScreenPlayer.module.css"
interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
}

const ImageWithFallback = ({
  src,
  alt,
  className = "",
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-white/5`}
        aria-label={alt}
      >
        <Music2 className="h-1/3 w-1/3 text-white/20" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      draggable={false}
    />
  );
};

interface FullScreenPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  isPremium?: boolean;
  premiumStatus?: any;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onClose: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  currentTime: number;
  duration: number;
  progress: number;
  onProgressChange: (progress: number) => void;
}

const formatTime = (timeInSeconds: number) => {
  if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function FullScreenPlayer({
  currentSong,
  isPlaying,
  isPremium = false,
  premiumStatus = null,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onClose,
  volume,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  currentTime,
  duration,
  progress,
  onProgressChange,
}: FullScreenPlayerProps) {
  const [liked, setLiked] = useState(false);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  const canViewLyrics = useMemo(() => {
    if (!isPremium) return false;

    const packageId = String(premiumStatus?.packageId ?? "").toLowerCase();
    const packageText = [
      premiumStatus?.packageName,
      premiumStatus?.premiumType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      ["personal", "family", "2", "3"].includes(packageId) ||
      packageText.includes("cá nhân") ||
      packageText.includes("gia đình") ||
      packageText.includes("personal") ||
      packageText.includes("family")
    );
  }, [isPremium, premiumStatus]);

  const safeProgress = clamp(Number(progress) || 0, 0, 100);
  const safeVolume = clamp(Number(volume) || 0, 0, 100);

  useEffect(() => {
    const controller = new AbortController();

    if (!canViewLyrics) {
      setIsLoadingLyrics(false);
      setLyrics([
        "Tính năng xem lời bài hát dành cho gói Premium Cá nhân hoặc Gia đình.",
      ]);

      return () => controller.abort();
    }

    const fetchLyrics = async () => {
      setIsLoadingLyrics(true);
      setLyrics([]);

      try {
        const artist = encodeURIComponent(currentSong.artistName || "");
        const title = encodeURIComponent(currentSong.title || "");

        const response = await fetch(
          `https://api.lyrics.ovh/v1/${artist}/${title}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Lyrics API returned ${response.status}`);
        }

        const data = await response.json();

        const lyricLines =
          typeof data.lyrics === "string"
            ? data.lyrics
                .split("\n")
                .map((line: string) => line.trim())
                .filter(Boolean)
            : [];

        setLyrics(
          lyricLines.length > 0
            ? lyricLines
            : ["Không tìm thấy lời bài hát này."],
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLyrics(["Không thể tải lời bài hát. Vui lòng thử lại sau."]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingLyrics(false);
        }
      }
    };

    fetchLyrics();

    return () => controller.abort();
  }, [
    canViewLyrics,
    currentSong.artistName,
    currentSong.id,
    currentSong.title,
  ]);

  return (
    <div className="fixed inset-0 z-[1000] isolate overflow-y-auto bg-slate-950 text-white lg:overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-70 blur-3xl"
        style={{
          backgroundImage: currentSong.coverUrl
            ? `url("${currentSong.coverUrl}")`
            : undefined,
        }}
      />
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.20),transparent_38%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-slate-950/20 to-slate-950/85" />

      {/* Top actions */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-7">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60 backdrop-blur-xl">
          <Music2 className="h-4 w-4 text-cyan-300" />
          Đang phát
        </div>

        <button
          type="button"
          onClick={onClose}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70 backdrop-blur-xl transition hover:scale-105 hover:bg-white/15 hover:text-white"
          aria-label="Thu nhỏ trình phát"
          title="Thu nhỏ"
        >
          <Minimize2 className="h-5 w-5 transition-transform group-hover:scale-110" />
        </button>
      </div>

      <div className="relative z-10 grid min-h-full grid-cols-1 lg:h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
        {/* Left side */}
        <section className="flex min-h-screen items-center justify-center px-5 pb-12 pt-24 sm:px-8 lg:min-h-0 lg:px-12 lg:py-20">
          <div className="w-full max-w-xl">
            {/* Cover */}
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute -inset-5 rounded-[2.25rem] bg-cyan-400/15 blur-3xl" />

              <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-[0_35px_100px_-25px_rgba(0,0,0,0.85)] backdrop-blur-sm">
                <ImageWithFallback
                  src={currentSong.coverUrl}
                  alt={`Ảnh bìa ${currentSong.title}`}
                  className="h-full w-full rounded-[1.55rem] object-cover transition duration-700 group-hover:scale-[1.025]"
                />

                <div className="pointer-events-none absolute inset-2 rounded-[1.55rem] bg-gradient-to-t from-black/35 via-transparent to-white/5" />
              </div>
            </div>

            {/* Song information */}
            <div className="mt-8 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                {isPremium && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </span>
                )}

                {currentSong.albumName && (
                  <span className="max-w-[230px] truncate rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                    {currentSong.albumName}
                  </span>
                )}
              </div>

              <h1 className="line-clamp-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {currentSong.title}
              </h1>

              <p className="mt-2 text-sm font-medium text-white/55 sm:text-base">
                {currentSong.artistName}
              </p>
            </div>

            {/* Progress */}
            <div className="mt-7">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={safeProgress}
                disabled={!duration}
                onChange={(event) =>
                  onProgressChange(Number(event.target.value))
                }
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 disabled:cursor-not-allowed disabled:opacity-50
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:bg-cyan-300
                  [&::-webkit-slider-thumb]:shadow-[0_0_18px_rgba(103,232,249,0.75)]
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:bg-cyan-300"
                style={{
                  background: `linear-gradient(to right, rgb(103 232 249) 0%, rgb(59 130 246) ${safeProgress}%, rgba(255,255,255,0.15) ${safeProgress}%, rgba(255,255,255,0.15) 100%)`,
                }}
                aria-label="Tiến trình bài hát"
              />

              <div className="mt-2 flex items-center justify-between text-xs font-medium tabular-nums text-white/45">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => setLiked((previous) => !previous)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  liked
                    ? "border-rose-400/30 bg-rose-400/15 text-rose-300"
                    : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"
                }`}
                aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart
                  className="h-5 w-5"
                  fill={liked ? "currentColor" : "none"}
                />
              </button>

              <button
                type="button"
                onClick={onPrevSong}
                className="flex h-12 w-12 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
                aria-label="Bài trước"
              >
                <SkipBack className="h-6 w-6" fill="currentColor" />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_18px_45px_-12px_rgba(255,255,255,0.65)] transition hover:scale-105 active:scale-95"
                aria-label={isPlaying ? "Tạm dừng" : "Phát nhạc"}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" fill="currentColor" />
                ) : (
                  <Play className="ml-1 h-8 w-8" fill="currentColor" />
                )}
              </button>

              <button
                type="button"
                onClick={onNextSong}
                className="flex h-12 w-12 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
                aria-label="Bài tiếp theo"
              >
                <SkipForward className="h-6 w-6" fill="currentColor" />
              </button>

              <div className="hidden h-11 w-11 sm:block" aria-hidden="true" />
            </div>

            {/* Secondary controls */}
            <div className="mx-auto mt-7 grid max-w-md grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl sm:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-xl px-2">
                <Volume2 className="h-4 w-4 shrink-0 text-white/45" />

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={safeVolume}
                  onChange={(event) =>
                    onVolumeChange(Number(event.target.value))
                  }
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:bg-white"
                  style={{
                    background: `linear-gradient(to right, white 0%, white ${safeVolume}%, rgba(255,255,255,0.15) ${safeVolume}%, rgba(255,255,255,0.15) 100%)`,
                  }}
                  aria-label="Âm lượng"
                />

                <span className="w-8 text-right text-xs tabular-nums text-white/45">
                  {safeVolume}
                </span>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                <Gauge className="h-4 w-4" />

                <select
                  value={playbackRate}
                  onChange={(event) =>
                    onPlaybackRateChange(Number(event.target.value))
                  }
                  className="cursor-pointer bg-transparent font-semibold text-white outline-none"
                  aria-label="Tốc độ phát"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <option
                      key={rate}
                      value={rate}
                      className="bg-slate-900 text-white"
                    >
                      {rate}x
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* Lyrics side */}
        <section className="min-h-[70vh] px-4 pb-8 sm:px-8 lg:h-screen lg:min-h-0 lg:px-7 lg:py-7 lg:pl-0">
          <div className="relative flex h-full min-h-[620px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl backdrop-blur-2xl lg:min-h-0">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                  Lyrics
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Lời bài hát
                </h2>
              </div>

              {!canViewLyrics && (
                <div className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
                  <Crown className="h-3.5 w-3.5" />
                  Premium
                </div>
              )}
            </div>

            <div className="pointer-events-none absolute left-0 right-0 top-[89px] z-10 h-16 bg-gradient-to-b from-slate-950/60 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-slate-950/85 to-transparent" />

            <div className="flex-1 overflow-y-auto px-6 pb-28 pt-12 sm:px-8 lg:px-10">
              {isLoadingLyrics ? (
                <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 text-white/50">
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-300" />
                  <span className="text-sm">Đang tải lời bài hát...</span>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl">
                  {lyrics.map((line, index) => (
                    <p
                      key={`${line}-${index}`}
                      className={`mb-6 text-xl font-semibold leading-relaxed tracking-tight transition duration-300 sm:text-2xl lg:text-[1.75rem] ${
                        lyrics.length === 1
                          ? "text-center text-white/65"
                          : "text-white/55 hover:translate-x-1 hover:text-white"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}