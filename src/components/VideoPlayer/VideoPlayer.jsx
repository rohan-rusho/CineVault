import React, { useEffect, useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Download, PictureInPicture2,
  Loader, AlertCircle, Subtitles, ChevronLeft
} from 'lucide-react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { processVideoSource, requiresIframeEmbed } from '@/services/videoSourceService';
import { formatTime } from '@/utils/formatters';
import { PLAYBACK_SPEEDS } from '@/utils/constants';
import './VideoPlayer.css';

export default function VideoPlayer({
  movieId,
  videoSource,
  subtitles = [],
  downloadUrl,
  title,
  onBack,
  initialTime = 0,
}) {
  const player = useVideoPlayer(movieId);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('speed');
  const [forceIframe, setForceIframe] = useState(false);
  const isIframe = requiresIframeEmbed(videoSource) || forceIframe;
  const processed = processVideoSource(videoSource);
  const iframeUrl = processed.embedUrl || videoSource;

  // Restore progress on mount
  useEffect(() => {
    async function restore() {
      if (initialTime > 0 && player.videoRef.current) {
        player.videoRef.current.currentTime = initialTime;
      } else {
        const progress = await player.restoreProgress();
        if (progress?.currentTime > 0 && progress.currentTime < progress.duration * 0.95) {
          if (player.videoRef.current) {
            player.videoRef.current.currentTime = progress.currentTime;
          }
        }
      }
    }
    if (!isIframe) {
      const timer = setTimeout(restore, 500);
      return () => clearTimeout(timer);
    }
  }, [isIframe]);

  // Handle subtitle selection
  useEffect(() => {
    const video = player.videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = tracks[i].language === player.selectedSubtitle ? 'showing' : 'hidden';
    }
  }, [player.selectedSubtitle]);

  const progressPercent = player.duration > 0
    ? (player.currentTime / player.duration) * 100
    : 0;
  const bufferedPercent = player.duration > 0
    ? (player.buffered / player.duration) * 100
    : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    player.seek(pct * player.duration);
  };

  if (processed.error && !processed.embedUrl) {
    return (
      <div className="player-error">
        <AlertCircle size={48} />
        <h3>Video Unavailable</h3>
        <p>{processed.error}</p>
        {onBack && <button onClick={onBack} className="player-error__back">Go Back</button>}
      </div>
    );
  }

  // Google Drive / Fallback Iframe Player
  if (isIframe && iframeUrl) {
    return (
      <div className="player" ref={player.containerRef}>
        {/* Back Button with Title */}
        {onBack && (
          <button className="player__back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
            <span>{title}</span>
          </button>
        )}
        <div className="player__iframe-wrapper">
          <iframe
            src={iframeUrl}
            className="player__iframe"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title={title || 'Movie Player'}
          />
        </div>
      </div>
    );
  }

  // HTML5 Video Player
  return (
    <div
      className="player"
      ref={player.containerRef}
      onMouseMove={player.showControlsTemporarily}
      onClick={(e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('player__video')) {
          player.togglePlay();
        }
      }}
    >
      <video
        ref={player.videoRef}
        className="player__video"
        src={processed.directUrl}
        preload="metadata"
        playsInline
        autoPlay
      >
        {subtitles.map((sub) => (
          <track
            key={sub.language}
            kind="subtitles"
            label={sub.label}
            srcLang={sub.language}
            src={sub.src}
          />
        ))}
      </video>

      {/* Back Button */}
      {onBack && (
        <div className={`player__top-bar ${player.showControls ? '' : 'player__top-bar--hidden'}`}>
          <button className="player__back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
            <span className="player__back-title">{title || 'Back'}</span>
          </button>
        </div>
      )}

      {/* Center Buffering */}
      {player.isBuffering && (
        <div className="player__buffering">
          <Loader size={48} className="animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {player.error && (
        <div className="player__error-overlay">
          <AlertCircle size={36} className="player__error-icon" style={{ color: 'var(--color-danger)' }} />
          <p style={{ margin: 'var(--space-2) 0' }}>{player.error}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button
              onClick={() => setForceIframe(true)}
              style={{
                background: 'var(--color-play)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                boxShadow: 'var(--shadow-play)'
              }}
            >
              Play in Iframe Mode (Bypass CORS)
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`player__controls ${player.showControls ? '' : 'player__controls--hidden'}`}>
        {/* Progress Bar */}
        <div className="player__progress" onClick={handleProgressClick}>
          <div className="player__progress-buffered" style={{ width: `${bufferedPercent}%` }} />
          <div className="player__progress-played" style={{ width: `${progressPercent}%` }}>
            <div className="player__progress-thumb" />
          </div>
        </div>

        {/* Control Row */}
        <div className="player__control-row">
          {/* Left Controls */}
          <div className="player__controls-left">
            <button onClick={player.togglePlay} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
              {player.isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
            </button>
            <button onClick={() => player.seekBackward(10)} aria-label="Rewind 10s">
              <SkipBack size={20} />
            </button>
            <button onClick={() => player.seekForward(10)} aria-label="Forward 10s">
              <SkipForward size={20} />
            </button>

            {/* Volume */}
            <div className="player__volume-group">
              <button onClick={player.toggleMute} aria-label={player.isMuted ? 'Unmute' : 'Mute'}>
                {player.isMuted || player.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                className="player__volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={player.isMuted ? 0 : player.volume}
                onChange={(e) => player.setVolume(parseFloat(e.target.value))}
                aria-label="Volume"
              />
            </div>

            <span className="player__time">
              {formatTime(player.currentTime)} / {formatTime(player.duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="player__controls-right">
            {/* Subtitles */}
            {subtitles.length > 0 && (
              <div className="player__dropdown-wrapper">
                <button onClick={() => { setShowSettings(!showSettings); setSettingsTab('subtitle'); }}>
                  <Subtitles size={20} />
                </button>
              </div>
            )}

            {/* Settings */}
            <div className="player__dropdown-wrapper">
              <button onClick={() => { setShowSettings(!showSettings); setSettingsTab('speed'); }}>
                <Settings size={20} />
              </button>
            </div>

            {/* Download */}
            {downloadUrl && (
              <a href={downloadUrl} download className="player__btn-link" aria-label="Download">
                <Download size={20} />
              </a>
            )}

            {/* PiP */}
            {document.pictureInPictureEnabled && (
              <button onClick={player.togglePiP} aria-label="Picture in Picture">
                <PictureInPicture2 size={20} />
              </button>
            )}

            {/* Fullscreen */}
            <button onClick={player.toggleFullscreen} aria-label="Fullscreen">
              {player.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      {showSettings && (
        <div className="player__settings-menu" onClick={() => setShowSettings(false)}>
          <div className="player__settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="player__settings-tabs">
              <button
                className={settingsTab === 'speed' ? 'active' : ''}
                onClick={() => setSettingsTab('speed')}
              >Speed</button>
              {subtitles.length > 0 && (
                <button
                  className={settingsTab === 'subtitle' ? 'active' : ''}
                  onClick={() => setSettingsTab('subtitle')}
                >Subtitles</button>
              )}
            </div>

            {settingsTab === 'speed' && (
              <div className="player__settings-list">
                {PLAYBACK_SPEEDS.map(speed => (
                  <button
                    key={speed}
                    className={`player__settings-item ${player.playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => { player.setPlaybackSpeed(speed); setShowSettings(false); }}
                  >
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </button>
                ))}
              </div>
            )}

            {settingsTab === 'subtitle' && (
              <div className="player__settings-list">
                <button
                  className={`player__settings-item ${player.selectedSubtitle === 'off' ? 'active' : ''}`}
                  onClick={() => { player.setSelectedSubtitle('off'); setShowSettings(false); }}
                >
                  Off
                </button>
                {subtitles.map(sub => (
                  <button
                    key={sub.language}
                    className={`player__settings-item ${player.selectedSubtitle === sub.language ? 'active' : ''}`}
                    onClick={() => { player.setSelectedSubtitle(sub.language); setShowSettings(false); }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
