/* ============================================
   CineVault — useMovieDetails Hook
   Loads full TMDB movie details for a single movie
   ============================================ */

import { useState, useEffect } from 'react';
import * as tmdbService from '@/services/tmdbService';
import * as catalogService from '@/services/movieCatalogService';

/**
 * Hook to load complete movie details by catalog ID
 */
export function useMovieDetails(movieId) {
  const [catalogData, setCatalogData] = useState(null);
  const [tmdbData, setTmdbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // First load from catalog
        const movie = await catalogService.getMovieById(movieId);
        if (!movie) {
          throw new Error('Movie not found in library');
        }

        if (!cancelled) setCatalogData(movie);

        // Then load TMDB details
        const details = await tmdbService.getMovieDetails(movie.tmdbId);
        if (!cancelled) setTmdbData(details);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          console.error('Error loading movie details:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [movieId]);

  // Compute derived data
  const director = tmdbData ? tmdbService.getDirector(tmdbData.credits) : null;
  const writers = tmdbData ? tmdbService.getWriters(tmdbData.credits) : [];
  const cast = tmdbData ? tmdbService.getTopCast(tmdbData.credits) : [];
  const certification = tmdbData ? tmdbService.getCertification(tmdbData.release_dates) : null;
  const trailerUrl = tmdbData ? tmdbService.getTrailerUrl(tmdbData.videos) : null;

  return {
    catalogData,
    tmdbData,
    director,
    writers,
    cast,
    certification,
    trailerUrl,
    loading,
    error,
  };
}

/**
 * Hook to load library-filtered similar/recommended movies
 */
export function useRelatedMovies(tmdbData) {
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbData) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        // Get collection movies from library
        if (tmdbData.belongs_to_collection) {
          try {
            const collection = await tmdbService.getCollection(
              tmdbData.belongs_to_collection.id
            );
            if (collection?.parts) {
              const libraryMatches = await catalogService.getLibraryMatchingTMDB(
                collection.parts.filter(p => p.id !== tmdbData.id)
              );
              if (!cancelled) setCollectionMovies(libraryMatches);
            }
          } catch (err) {
            console.error('Error loading collection:', err);
          }
        }

        // Get recommendations + similar filtered by library
        const allRelated = [
          ...(tmdbData.recommendations?.results || []),
          ...(tmdbData.similar?.results || []),
        ];

        // Deduplicate by TMDB ID
        const unique = Array.from(
          new Map(allRelated.map(m => [m.id, m])).values()
        ).filter(m => m.id !== tmdbData.id);

        const libraryMatches = await catalogService.getLibraryMatchingTMDB(unique);
        if (!cancelled) setSimilarMovies(libraryMatches);
      } catch (err) {
        console.error('Error loading related movies:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tmdbData]);

  return { collectionMovies, similarMovies, loading };
}
