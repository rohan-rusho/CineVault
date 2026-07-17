/* ============================================
   CineVault — Constants
   ============================================ */

export const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
export const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
export const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001';

// TMDB Image sizes
export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    xlarge: 'w780',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
  logo: {
    small: 'w92',
    medium: 'w154',
    large: 'w300',
    xlarge: 'w500',
    original: 'original',
  },
};

// TMDB Genre ID to Name mapping
export const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Watch history thresholds
export const WATCH_THRESHOLDS = {
  MINIMUM_WATCH_SECONDS: 60,         // Min seconds before saving progress
  COMPLETION_PERCENTAGE: 90,          // % to consider movie completed
  SAVE_INTERVAL_MS: 15000,           // Save progress every 15 seconds
  CONTINUE_WATCHING_MIN_PERCENT: 5,  // Min % to show in continue watching
  CONTINUE_WATCHING_MAX_PERCENT: 90, // Max % before removing from continue watching
  RECENTLY_WATCHED_LIMIT: 20,        // Max items in recently watched
};

// Video player defaults
export const PLAYER_DEFAULTS = {
  volume: 1,
  playbackSpeed: 1,
  subtitleLanguage: 'off',
  autoplay: false,
};

// Playback speed options
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Keyboard shortcuts
export const PLAYER_SHORTCUTS = {
  ' ': 'playPause',
  'ArrowLeft': 'seekBackward',
  'ArrowRight': 'seekForward',
  'ArrowUp': 'volumeUp',
  'ArrowDown': 'volumeDown',
  'm': 'mute',
  'M': 'mute',
  'f': 'fullscreen',
  'F': 'fullscreen',
};

// IndexedDB config
export const IDB_CONFIG = {
  dbName: 'cinevault-history',
  version: 1,
  stores: {
    watchProgress: 'watchProgress',
    watchHistory: 'watchHistory',
    statistics: 'statistics',
  },
};

// Navigation links
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Movies', path: '/movies' },
  { label: 'Collections', path: '/collections' },
];

// Placeholder images
export const PLACEHOLDER_IMAGES = {
  poster: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="#1a1a2e" width="300" height="450"/><text fill="#4a4a62" font-family="sans-serif" font-size="14" text-anchor="middle" x="150" y="220">No Poster</text><path d="M130 190 L170 190 L170 210 L130 210 Z" fill="none" stroke="#4a4a62" stroke-width="1.5"/></svg>`),
  backdrop: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect fill="#10101a" width="1280" height="720"/><text fill="#4a4a62" font-family="sans-serif" font-size="20" text-anchor="middle" x="640" y="360">No Backdrop Available</text></svg>`),
  profile: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="185" height="278" viewBox="0 0 185 278"><rect fill="#1a1a2e" width="185" height="278" rx="8"/><circle cx="92.5" cy="100" r="35" fill="#2a2a3e"/><ellipse cx="92.5" cy="195" rx="50" ry="40" fill="#2a2a3e"/></svg>`),
};
