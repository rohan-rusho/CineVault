import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '@/components/MovieCard/MovieCard';
import { SkeletonCard } from '@/components/SkeletonLoader/SkeletonLoader';
import * as catalogService from '@/services/movieCatalogService';
import * as tmdbService from '@/services/tmdbService';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    async function performSearch() {
      setLoading(true);
      try {
        const allMovies = await catalogService.getAllMovies();
        const q = query.toLowerCase().trim();

        // Enrich all local catalog movies with details from TMDB to search by cast/crew/genres/year
        const enrichedResults = await Promise.allSettled(
          allMovies.map(async (movie) => {
            const tmdb = await tmdbService.getMovieDetails(movie.tmdbId);
            return { ...movie, tmdb };
          })
        );

        const enriched = enrichedResults
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value);

        // Filter based on flexible query match
        const filtered = enriched.filter(movie => {
          const tmdb = movie.tmdb;
          if (!tmdb) return movie.title?.toLowerCase().includes(q) || movie.id.includes(q);

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

        if (!cancelled) {
          setResults(filtered);
        }
      } catch (err) {
        console.error('Error during search:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    performSearch();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="search-page">
      <div className="container">
        <header className="search-page__header">
          <h1 className="search-page__title">Search Results for "{query}"</h1>
          <p className="search-page__subtitle">
            {loading ? 'Searching...' : `${results.length} movies found`}
          </p>
        </header>

        {loading ? (
          <div className="search-page__grid">
            <SkeletonCard count={12} />
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="search-page__grid">
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="search-page__empty">
                <p>No results found matching your search.</p>
                <span>Try searching by movie title, actor, director, or genre.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
