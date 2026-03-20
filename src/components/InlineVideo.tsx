"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface InlineVideoProps {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  onSeeking?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}

export default function InlineVideo({
  src,
  className = "",
  muted = false,
  loop = false,
  autoPlay = false,
  onEnded,
  onSeeking,
  onTimeUpdate,
}: InlineVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.setAttribute("webkit-playsinline", "true");
    el.setAttribute("playsinline", "true");
    el.setAttribute("x-webkit-airplay", "deny");
    // Force muted attribute via DOM for iOS compatibility
    el.muted = muted || autoPlay;
    if (autoPlay && muted) {
      el.play().catch(() => {});
    }
  }, [autoPlay, muted]);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      setIsWaiting(true);
      el.play()
        .then(() => {
          setIsPlaying(true);
          setShowControls(true);
          setIsWaiting(false);
          scheduleHide();
        })
        .catch(() => {
          setIsWaiting(false);
          // If unmuted play fails, try muted (iOS restriction)
          el.muted = true;
          el.play()
            .then(() => {
              setIsPlaying(true);
              setShowControls(true);
              scheduleHide();
            })
            .catch(() => {
              setHasError(true);
            });
        });
    } else {
      el.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  }, [scheduleHide]);

  const handleTap = useCallback(() => {
    if (hasError) {
      // Retry on tap after error
      setHasError(false);
      const el = videoRef.current;
      if (el) {
        el.load();
        togglePlay();
      }
      return;
    }
    if (isPlaying && !showControls) {
      setShowControls(true);
      scheduleHide();
    } else {
      togglePlay();
    }
  }, [isPlaying, showControls, hasError, scheduleHide, togglePlay]);

  const handleTimeUpdateInternal = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const el = e.currentTarget;
      setCurrentTime(el.currentTime);
      setProgress(el.duration ? el.currentTime / el.duration : 0);
      onTimeUpdate?.(e);
    },
    [onTimeUpdate]
  );

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setDuration(e.currentTarget.duration);
    },
    []
  );

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    onEnded?.();
  }, [onEnded]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative bg-black ${className}`}
      onClick={handleTap}
      style={{ minHeight: canPlay ? undefined : 200 }}
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        className="w-full h-auto"
        muted={muted}
        loop={loop}
        onTimeUpdate={handleTimeUpdateInternal}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onSeeking={onSeeking}
        onCanPlay={() => setCanPlay(true)}
        onWaiting={() => setIsWaiting(true)}
        onPlaying={() => setIsWaiting(false)}
        onError={() => setHasError(true)}
        onPlay={() => { setIsPlaying(true); scheduleHide(); }}
        onPause={() => { setIsPlaying(false); setShowControls(true); }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Play/Pause overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {hasError ? (
          <div className="flex flex-col items-center gap-2 px-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-xs text-white/80 font-medium">Tap to retry</span>
          </div>
        ) : isWaiting ? (
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-3 pb-2 pt-6 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/80 font-mono w-8">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-white/80 font-mono w-8 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
