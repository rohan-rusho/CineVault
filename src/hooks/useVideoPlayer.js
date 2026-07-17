/* ============================================
   CineVault — useVideoPlayer Hook
   Player state management and progress tracking
   ============================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as watchHistoryService from '@/services/watchHistoryService';
import * as playerPrefs from '@/services/playerPreferenceService';
import { WATCH_THRESHOLDS, PLAYER_SHORTCUTS } from '@/utils/constants';

export function useVideoPlayer(movieId) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolumeState] = useState(playerPrefs.getVolume());
  const [isMuted, setIsMuted] = useState(playerPrefs.getMuted());
  const [playbackSpeed, setPlaybackSpeedState] = useState(playerPrefs.getPlaybackSpeed());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [isPiP, setIsPiP] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState(playerPrefs.getSubtitleLanguage());

  // Save progress to IndexedDB
  const saveProgress = useCallback(async () => {
    if (!movieId || !videoRef.current) return;
    const video = videoRef.current;
    if (video.currentTime < WATCH_THRESHOLDS.MINIMUM_WATCH_SECONDS) return;
    
    await watchHistoryService.saveProgress(movieId, video.currentTime, video.duration);
  }, [movieId]);

  // Restore progress
  const restoreProgress = useCallback(async () => {
    if (!movieId) return null;
    const progress = await watchHistoryService.getProgress(movieId);
    return progress;
  }, [movieId]);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  // Seek
  const seek = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration));
  }, []);

  const seekForward = useCallback((seconds = 10) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.min(video.currentTime + seconds, video.duration);
  }, []);

  const seekBackward = useCallback((seconds = 10) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(video.currentTime - seconds, 0);
  }, []);

  // Volume
  const setVolume = useCallback((vol) => {
    const v = Math.max(0, Math.min(1, vol));
    setVolumeState(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      if (v > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
    playerPrefs.setVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    playerPrefs.setMuted(video.muted);
  }, []);

  // Playback speed
  const setPlaybackSpeed = useCallback((speed) => {
    setPlaybackSpeedState(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    playerPrefs.setPlaybackSpeed(speed);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Picture-in-Picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, []);

  // Show/hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlers = {
      play: () => setIsPlaying(true),
      pause: () => {
        setIsPlaying(false);
        setShowControls(true);
        saveProgress();
      },
      timeupdate: () => setCurrentTime(video.currentTime),
      durationchange: () => setDuration(video.duration),
      progress: () => {
        if (video.buffered.length > 0) {
          setBuffered(video.buffered.end(video.buffered.length - 1));
        }
      },
      waiting: () => setIsBuffering(true),
      playing: () => setIsBuffering(false),
      error: () => setError('Video playback error. The source may be unavailable.'),
      ended: () => {
        setIsPlaying(false);
        setShowControls(true);
        watchHistoryService.markCompleted(movieId);
      },
      enterpictureinpicture: () => setIsPiP(true),
      leavepictureinpicture: () => setIsPiP(false),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    // Set initial values
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackSpeed;

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [movieId, volume, isMuted, playbackSpeed, saveProgress]);

  // Progress save interval
  useEffect(() => {
    if (isPlaying) {
      saveIntervalRef.current = setInterval(saveProgress, WATCH_THRESHOLDS.SAVE_INTERVAL_MS);
    } else {
      clearInterval(saveIntervalRef.current);
    }

    return () => clearInterval(saveIntervalRef.current);
  }, [isPlaying, saveProgress]);

  // Save on page visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) saveProgress();
    };

    const handleBeforeUnload = () => saveProgress();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveProgress]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't capture if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const action = PLAYER_SHORTCUTS[e.key];
      if (!action) return;

      e.preventDefault();

      switch (action) {
        case 'playPause': togglePlay(); break;
        case 'seekForward': seekForward(); break;
        case 'seekBackward': seekBackward(); break;
        case 'volumeUp': setVolume(volume + 0.1); break;
        case 'volumeDown': setVolume(volume - 0.1); break;
        case 'mute': toggleMute(); break;
        case 'fullscreen': toggleFullscreen(); break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekForward, seekBackward, setVolume, volume, toggleMute, toggleFullscreen]);

  return {
    videoRef,
    containerRef,
    // State
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    playbackSpeed,
    isFullscreen,
    showControls,
    isBuffering,
    error,
    isPiP,
    selectedSubtitle,
    // Actions
    togglePlay,
    seek,
    seekForward,
    seekBackward,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    toggleFullscreen,
    togglePiP,
    showControlsTemporarily,
    setSelectedSubtitle,
    restoreProgress,
    saveProgress,
  };
}
