/* ============================================
   CineVault — Watch History Service
   IndexedDB-based persistent watch tracking
   ============================================ */

import { openDB } from 'idb';
import { IDB_CONFIG, WATCH_THRESHOLDS } from '@/utils/constants';

let dbPromise = null;

/**
 * Initialize the IndexedDB database
 */
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(IDB_CONFIG.dbName, IDB_CONFIG.version, {
      upgrade(db) {
        // Watch progress store
        if (!db.objectStoreNames.contains('watchProgress')) {
          const progressStore = db.createObjectStore('watchProgress', { keyPath: 'movieId' });
          progressStore.createIndex('lastWatched', 'lastWatched');
          progressStore.createIndex('watchedPercentage', 'watchedPercentage');
        }

        // Statistics store
        if (!db.objectStoreNames.contains('statistics')) {
          db.createObjectStore('statistics', { keyPath: 'key' });
        }
      },
    }).catch(err => {
      console.error('Failed to open IndexedDB:', err);
      dbPromise = null;
      return null;
    });
  }
  return dbPromise;
}

/**
 * Save watch progress for a movie
 */
export async function saveProgress(movieId, currentTime, duration) {
  const db = await getDB();
  if (!db) return;

  const watchedPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  const isCompleted = watchedPercentage >= WATCH_THRESHOLDS.COMPLETION_PERCENTAGE;

  const existingEntry = await db.get('watchProgress', movieId);

  const entry = {
    movieId,
    currentTime,
    duration,
    watchedPercentage,
    isCompleted,
    lastWatched: new Date().toISOString(),
    firstWatched: existingEntry?.firstWatched || new Date().toISOString(),
    watchCount: isCompleted
      ? (existingEntry?.watchCount || 0) + (existingEntry?.isCompleted ? 0 : 1)
      : existingEntry?.watchCount || 0,
  };

  await db.put('watchProgress', entry);

  // Update statistics
  await updateStatistics(movieId, currentTime, existingEntry);
}

/**
 * Get watch progress for a movie
 */
export async function getProgress(movieId) {
  const db = await getDB();
  if (!db) return null;

  try {
    return await db.get('watchProgress', movieId);
  } catch {
    return null;
  }
}

/**
 * Get all movies that are in "continue watching" state
 */
export async function getContinueWatching() {
  const db = await getDB();
  if (!db) return [];

  try {
    const allProgress = await db.getAll('watchProgress');
    return allProgress
      .filter(entry => {
        const pct = entry.watchedPercentage || 0;
        return (
          !entry.isCompleted &&
          pct >= WATCH_THRESHOLDS.CONTINUE_WATCHING_MIN_PERCENT &&
          pct < WATCH_THRESHOLDS.CONTINUE_WATCHING_MAX_PERCENT &&
          entry.currentTime >= WATCH_THRESHOLDS.MINIMUM_WATCH_SECONDS
        );
      })
      .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
  } catch {
    return [];
  }
}

/**
 * Get recently watched movies (both in-progress and completed)
 */
export async function getRecentlyWatched(limit = WATCH_THRESHOLDS.RECENTLY_WATCHED_LIMIT) {
  const db = await getDB();
  if (!db) return [];

  try {
    const allProgress = await db.getAll('watchProgress');
    return allProgress
      .filter(entry => entry.currentTime >= WATCH_THRESHOLDS.MINIMUM_WATCH_SECONDS)
      .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Mark a movie as completed
 */
export async function markCompleted(movieId) {
  const db = await getDB();
  if (!db) return;

  const entry = await db.get('watchProgress', movieId);
  if (entry) {
    entry.isCompleted = true;
    entry.watchedPercentage = 100;
    entry.lastWatched = new Date().toISOString();
    entry.watchCount = (entry.watchCount || 0) + 1;
    await db.put('watchProgress', entry);
  }
}

/**
 * Remove a movie from watch history
 */
export async function removeFromHistory(movieId) {
  const db = await getDB();
  if (!db) return;
  await db.delete('watchProgress', movieId);
}

/**
 * Clear all watch history
 */
export async function clearHistory() {
  const db = await getDB();
  if (!db) return;
  await db.clear('watchProgress');
  await db.clear('statistics');
}

/**
 * Update aggregate statistics
 */
async function updateStatistics(movieId, currentTime, previousEntry) {
  const db = await getDB();
  if (!db) return;

  try {
    // Total watch time
    const timeKey = 'totalWatchTime';
    let timeStat = await db.get('statistics', timeKey);
    const prevTime = previousEntry?.currentTime || 0;
    const timeDelta = Math.max(0, currentTime - prevTime);
    
    await db.put('statistics', {
      key: timeKey,
      value: (timeStat?.value || 0) + timeDelta,
    });

    // Unique movies started
    if (!previousEntry) {
      const startedKey = 'moviesStarted';
      let startedStat = await db.get('statistics', startedKey);
      await db.put('statistics', {
        key: startedKey,
        value: (startedStat?.value || 0) + 1,
      });
    }
  } catch (err) {
    console.error('Error updating statistics:', err);
  }
}

/**
 * Get viewing statistics
 */
export async function getStatistics() {
  const db = await getDB();
  if (!db) return { totalWatchTime: 0, moviesStarted: 0, moviesCompleted: 0 };

  try {
    const totalWatchTime = (await db.get('statistics', 'totalWatchTime'))?.value || 0;
    const moviesStarted = (await db.get('statistics', 'moviesStarted'))?.value || 0;

    // Count completed movies
    const allProgress = await db.getAll('watchProgress');
    const moviesCompleted = allProgress.filter(e => e.isCompleted).length;

    return { totalWatchTime, moviesStarted, moviesCompleted };
  } catch {
    return { totalWatchTime: 0, moviesStarted: 0, moviesCompleted: 0 };
  }
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable() {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}
