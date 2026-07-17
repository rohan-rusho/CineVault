/* ============================================
   CineVault — useMovies Hook
   Provides movie catalog data to components
   ============================================ */

import { useState, useEffect, useCallback } from 'react';
import * as catalogService from '@/services/movieCatalogService';
import * as tmdbService from '@/services/tmdbService';

/**
 * Hook to load all movies from the catalog with their TMDB data
 */
export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const catalogMovies = await catalogService.getAllMovies();
      setMovies(catalogMovies);
    } catch (err) {
      setError(err.message);
      console.error('Error loading movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  return { movies, loading, error, reload: loadMovies };
}

/**
 * Hook to load featured movies
 */
export function useFeaturedMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const featured = await catalogService.getFeaturedMovies();
        setMovies(featured);
      } catch (err) {
        console.error('Error loading featured movies:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { movies, loading };
}

/**
 * Hook to get recently added movies
 */
export function useRecentlyAdded(limit = 20) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const recent = await catalogService.getRecentlyAdded(limit);
        setMovies(recent);
      } catch (err) {
        console.error('Error loading recently added:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [limit]);

  return { movies, loading };
}

/**
 * Hook to get movies enriched with TMDB details
 * Loads TMDB data for an array of catalog movies
 */
export function useEnrichedMovies(catalogMovies) {
  const [enriched, setEnriched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!catalogMovies?.length) {
      setEnriched([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function enrich() {
      try {
        const results = await Promise.allSettled(
          catalogMovies.map(async (movie) => {
            const tmdbData = await tmdbService.getMovieDetails(movie.tmdbId);
            return { ...movie, tmdb: tmdbData };
          })
        );

        if (!cancelled) {
          setEnriched(
            results
              .filter(r => r.status === 'fulfilled')
              .map(r => r.value)
          );
        }
      } catch (err) {
        console.error('Error enriching movies:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    enrich();
    return () => { cancelled = true; };
  }, [catalogMovies]);

  return { movies: enriched, loading };
}
