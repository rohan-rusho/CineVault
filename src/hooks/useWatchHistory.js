/* ============================================
   CineVault — useWatchHistory Hook
   ============================================ */

import { useState, useEffect, useCallback } from 'react';
import * as watchHistoryService from '@/services/watchHistoryService';

/**
 * Hook for continue watching movies
 */
export function useContinueWatching() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await watchHistoryService.getContinueWatching();
      setMovies(data);
    } catch (err) {
      console.error('Error loading continue watching:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { movies, loading, reload: load };
}

/**
 * Hook for recently watched movies
 */
export function useRecentlyWatched(limit = 20) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await watchHistoryService.getRecentlyWatched(limit);
      setMovies(data);
    } catch (err) {
      console.error('Error loading recently watched:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { movies, loading, reload: load };
}

/**
 * Hook for a single movie's watch progress
 */
export function useWatchProgress(movieId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await watchHistoryService.getProgress(movieId);
        setProgress(data);
      } catch (err) {
        console.error('Error loading watch progress:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [movieId]);

  return { progress, loading };
}

/**
 * Hook for viewing statistics
 */
export function useViewingStats() {
  const [stats, setStats] = useState({
    totalWatchTime: 0,
    moviesStarted: 0,
    moviesCompleted: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await watchHistoryService.getStatistics();
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }
    load();
  }, []);

  return stats;
}
