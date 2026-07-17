/* ============================================
   CineVault — Player Preference Service
   localStorage-based player settings
   ============================================ */

import { PLAYER_DEFAULTS } from '@/utils/constants';

const STORAGE_PREFIX = 'cinevault_';

function getKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

function safeGet(key, defaultValue) {
  try {
    const value = localStorage.getItem(getKey(key));
    if (value === null) return defaultValue;
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to save preference:', key, err);
  }
}

// ---- Volume ----
export function getVolume() {
  return safeGet('volume', PLAYER_DEFAULTS.volume);
}

export function setVolume(volume) {
  safeSet('volume', Math.max(0, Math.min(1, volume)));
}

// ---- Playback Speed ----
export function getPlaybackSpeed() {
  return safeGet('playbackSpeed', PLAYER_DEFAULTS.playbackSpeed);
}

export function setPlaybackSpeed(speed) {
  safeSet('playbackSpeed', speed);
}

// ---- Subtitle Language ----
export function getSubtitleLanguage() {
  return safeGet('subtitleLanguage', PLAYER_DEFAULTS.subtitleLanguage);
}

export function setSubtitleLanguage(language) {
  safeSet('subtitleLanguage', language);
}

// ---- Muted State ----
export function getMuted() {
  return safeGet('muted', false);
}

export function setMuted(muted) {
  safeSet('muted', muted);
}

// ---- Autoplay ----
export function getAutoplay() {
  return safeGet('autoplay', PLAYER_DEFAULTS.autoplay);
}

export function setAutoplay(autoplay) {
  safeSet('autoplay', autoplay);
}

// ---- Get All Preferences ----
export function getAllPreferences() {
  return {
    volume: getVolume(),
    playbackSpeed: getPlaybackSpeed(),
    subtitleLanguage: getSubtitleLanguage(),
    muted: getMuted(),
    autoplay: getAutoplay(),
  };
}

// ---- Reset All ----
export function resetPreferences() {
  const keys = ['volume', 'playbackSpeed', 'subtitleLanguage', 'muted', 'autoplay'];
  keys.forEach(key => {
    try {
      localStorage.removeItem(getKey(key));
    } catch { /* ignore */ }
  });
}
