/* ============================================
   CineVault — Formatting Utilities
   ============================================ */

/**
 * Format runtime minutes into "Xh Ym" format
 */
export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format seconds into "H:MM:SS" or "M:SS" format
 */
export function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format a date string into readable format
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Extract year from date string
 */
export function getYear(dateString) {
  if (!dateString) return '';
  return new Date(dateString).getFullYear().toString();
}

/**
 * Format a rating (0-10) to one decimal place
 */
export function formatRating(rating) {
  if (rating == null || rating === 0) return 'NR';
  return Number(rating).toFixed(1);
}

/**
 * Format vote count with K/M suffixes
 */
export function formatVoteCount(count) {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Format watch percentage
 */
export function formatWatchPercentage(current, total) {
  if (!current || !total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Format total watch time from seconds
 */
export function formatTotalWatchTime(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Create URL-safe slug from a string
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Format relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(timestamp);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Format money/budget amounts
 */
export function formatMoney(amount) {
  if (!amount) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
