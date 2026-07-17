/* ============================================
   CineVault — useSearch Hook
   ============================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as catalogService from '@/services/movieCatalogService';
import * as tmdbService from '@/services/tmdbService';
import { debounce } from '@/utils/debounce';

/**
 * Hook for searching the local movie catalog with TMDB enrichment
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const abortRef = useRef(false);

  const performSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery?.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      abortRef.current = false;
      setLoading(true);

      try {
        // Search local catalog
        const catalogResults = await catalogService.searchCatalog(searchQuery);

        // Also load all movies and do a more flexible match
        const allMovies = await catalogService.getAllMovies();
        const q = searchQuery.toLowerCase().trim();

        // Get TMDB details for matching movies to search by cast, genres etc.
        const enrichedResults = await Promise.allSettled(
          allMovies.map(async (movie) => {
            const tmdb = await tmdbService.getMovieDetails(movie.tmdbId);
            return { ...movie, tmdb };
          })
        );

        const enriched = enrichedResults
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value);

        // Filter by query against title, cast, genres, year
        const filtered = enriched.filter(movie => {
          const tmdb = movie.tmdb;
          if (!tmdb) return catalogResults.some(cr => cr.id === movie.id);

          // Title match
          if (tmdb.title?.toLowerCase().includes(q)) return true;
          if (tmdb.original_title?.toLowerCase().includes(q)) return true;

          // Genre match
          if (tmdb.genres?.some(g => g.name.toLowerCase().includes(q))) return true;

          // Cast match
          if (tmdb.credits?.cast?.some(c => c.name.toLowerCase().includes(q))) return true;

          // Year match
          if (tmdb.release_date?.startsWith(q)) return true;

          // Director match
          const director = tmdbService.getDirector(tmdb.credits);
          if (director?.name?.toLowerCase().includes(q)) return true;

          return false;
        });

        // Deduplicate
        const unique = Array.from(new Map(filtered.map(m => [m.id, m])).values());

        if (!abortRef.current) {
          setResults(unique);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (!abortRef.current) setResults([]);
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    }, 300),
    []
  );

  const search = useCallback((q) => {
    setQuery(q);
    if (!q?.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    performSearch(q);
  }, [performSearch]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    abortRef.current = true;
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // Keyboard shortcut: Ctrl+K or /
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === '/' && !isOpen && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        open();
      }
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, open, close]);

  return {
    query,
    results,
    loading,
    isOpen,
    search,
    open,
    close,
    toggle,
  };
}
