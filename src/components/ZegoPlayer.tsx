import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { Headphones, Mic, Radio, Users, Waves, X } from "lucide-react";

interface Props {
  roomId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
  isHost?: boolean;
  mode?: "live" | "podcast";
  liveTitle?: string;
}

export default function ZegoPlayer({
  roomId,
  userId,
  userName,
  onLeave,
  isHost = false,
  mode = "live",
  liveTitle,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<any>(null);
  const joinedRef = useRef(false);
  const destroyedRef = useRef(false);
  const leaveNotifiedRef = useRef(false);

  const appID = 2070696777;
  const serverSecret = "b3095e133cdf7601aafd2288c61dbb1a";
  const isPodcastMode = mode === "podcast";

  useEffect(() => {
    if (joinedRef.current) return;

    let cancelled = false;

    const notifyLeaveOnce = () => {
      if (leaveNotifiedRef.current) return;
      leaveNotifiedRef.current = true;
      onLeave();
    };

    const destroyOnce = () => {
      if (destroyedRef.current || !zegoRef.current) return;

      destroyedRef.current = true;

      try {
        zegoRef.current.destroy();
      } catch (error) {
        console.error("Zego destroy error:", error);
      } finally {
        zegoRef.current = null;
      }
    };

    const joinRoom = async () => {
      try {
        if (!containerRef.current) {
          throw new Error("Khong tim thay container de khoi tao phong live.");
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName
        );

        const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

        if (cancelled) {
          try {
            zegoInstance.destroy();
          } catch {}
          return;
        }

        zegoRef.current = zegoInstance;
        joinedRef.current = true;
        destroyedRef.current = false;
        leaveNotifiedRef.current = false;

        zegoInstance.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: isHost ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience,
            },
          },
          showPreJoinView: false,
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: isHost,
          showUserList: true,
          showLeavingView: false,
          onLeaveRoom: () => {
            joinedRef.current = false;
            notifyLeaveOnce();
          },
        });
      } catch (error: any) {
        console.error("Qua trinh tham gia that bai:", error);
        alert("Loi Zego: " + (error?.message || "Khong the tham gia phong live"));
        notifyLeaveOnce();
      }
    };

    joinRoom();

    return () => {
      cancelled = true;
      joinedRef.current = false;
      destroyOnce();
    };
  }, [appID, isHost, onLeave, roomId, userId, userName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_50%,_#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:26px_26px] opacity-30" />

      <div className="relative z-10 flex min-h-screen flex-col p-3 sm:p-5 lg:p-6">
        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="order-2 flex flex-col justify-between rounded-[30px] border border-white/10 bg-black/35 p-5 backdrop-blur-2xl lg:order-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-200">
                <Radio className="h-4 w-4" />
                {isPodcastMode ? "Phong podcast live" : "Phong live"}
              </div>

              <h1 className="mt-4 text-2xl font-black leading-tight text-white">
                {liveTitle || `${userName} dang phat truc tiep`}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {isHost
                  ? "Ban dang o che do host. Micro se duoc uu tien de bat dau buoi noi chuyen."
                  : "Ban dang nghe voi vai tro khan gia. Co the theo doi room ma khong can bat camera."}
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-900/35">
                      {isHost ? <Mic className="h-5 w-5 text-white" /> : <Headphones className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{isHost ? "Che do Host" : "Che do Audience"}</p>
                      <p className="text-xs text-slate-400">
                        {isHost ? "Micro bat khi vao phong" : "Nghe truc tiep tu phong live"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-200">
                      <Waves className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Uu tien am thanh</p>
                      <p className="text-xs text-slate-400">Camera tat mac dinh de tap trung vao am thanh</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Phong</p>
                      <p className="text-xs text-slate-400 break-all">{roomId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onLeave}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
              {isPodcastMode ? "Thoat podcast" : "Thoat live"}
            </button>
          </aside>

          <section className="order-1 flex min-h-[70vh] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur-xl lg:order-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-rose-200">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
                  </span>
                  Dang len song
                </div>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {isPodcastMode ? "Phong podcast truc tiep" : "Phong live"}
                </h2>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                {isHost ? "Ban dang dieu khien phong" : "Ban dang theo doi room"}
              </div>
            </div>

            <div className="relative flex-1 p-2 sm:p-3">
              <div
                ref={containerRef}
                className="zego-room-shell h-full min-h-[58vh] overflow-hidden rounded-[26px] border border-white/8 bg-black/30"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
