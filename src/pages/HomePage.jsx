import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection/HeroSection';
import MovieRow from '@/components/MovieRow/MovieRow';
import { SkeletonHero, SkeletonRow } from '@/components/SkeletonLoader/SkeletonLoader';
import { useFeaturedMovies, useMovies, useEnrichedMovies } from '@/hooks/useMovies';
import { useContinueWatching, useRecentlyWatched } from '@/hooks/useWatchHistory';
import * as catalogService from '@/services/movieCatalogService';
import { GENRE_MAP } from '@/utils/constants';

export default function HomePage() {
  const { movies: allMovies, loading: catalogLoading } = useMovies();
  const { movies: featuredMovies, loading: featuredLoading } = useFeaturedMovies();
  const { movies: continueWatching } = useContinueWatching();
  const { movies: recentlyWatched } = useRecentlyWatched();
  const { movies: enrichedMovies, loading: enrichLoading } = useEnrichedMovies(allMovies);
  const [genreRows, setGenreRows] = useState([]);

  // Build genre-based rows from enriched movies
  useEffect(() => {
    if (!enrichedMovies.length) return;

    const genreGroups = {};
    enrichedMovies.forEach(movie => {
      const genres = movie.tmdb?.genres || [];
      genres.forEach(g => {
        if (!genreGroups[g.id]) {
          genreGroups[g.id] = { name: g.name, movies: [] };
        }
        // Avoid duplicates
        if (!genreGroups[g.id].movies.find(m => m.id === movie.id)) {
          genreGroups[g.id].movies.push(movie);
        }
      });
    });

    // Filter out genres with fewer than 2 movies, sort by count
    const rows = Object.entries(genreGroups)
      .filter(([_, group]) => group.movies.length >= 2)
      .sort((a, b) => b[1].movies.length - a[1].movies.length)
      .slice(0, 8)
      .map(([id, group]) => ({
        id,
        title: group.name,
        movies: group.movies,
      }));

    setGenreRows(rows);
  }, [enrichedMovies]);

  // Build continue watching row from catalog data
  const continueWatchingMovies = continueWatching
    .map(cw => allMovies.find(m => m.id === cw.movieId))
    .filter(Boolean);

  const recentlyWatchedMovies = recentlyWatched
    .map(rw => allMovies.find(m => m.id === rw.movieId))
    .filter(Boolean)
    .filter(m => !continueWatching.some(cw => cw.movieId === m.id));

  const progressMap = {};
  continueWatching.forEach(cw => { progressMap[cw.movieId] = cw; });
  recentlyWatched.forEach(rw => { if (!progressMap[rw.movieId]) progressMap[rw.movieId] = rw; });

  const loading = catalogLoading || featuredLoading;

  return (
    <div className="home-page">
      {/* Hero Section */}
      {loading ? (
        <SkeletonHero />
      ) : (
        <HeroSection featuredMovies={featuredMovies.length > 0 ? featuredMovies : allMovies.slice(0, 5)} />
      )}

      <div className="home-page__rows">
        {/* Continue Watching */}
        {continueWatchingMovies.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueWatchingMovies}
            progressMap={progressMap}
          />
        )}

        {/* Recently Watched */}
        {recentlyWatchedMovies.length > 0 && (
          <MovieRow title="Recently Watched" movies={recentlyWatchedMovies} />
        )}

        {/* Featured Movies */}
        {featuredMovies.length > 0 && (
          <MovieRow title="Featured" movies={featuredMovies} />
        )}

        {/* Recently Added */}
        {allMovies.length > 0 && (
          <MovieRow
            title="Recently Added"
            movies={[...allMovies].reverse().slice(0, 20)}
          />
        )}

        {/* Genre-based Rows */}
        {enrichLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          genreRows.map(row => (
            <MovieRow key={row.id} title={row.title} movies={row.movies} />
          ))
        )}

        {/* Empty state */}
        {!loading && allMovies.length === 0 && (
          <div className="home-page__empty container">
            <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Welcome to CineVault
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                Your movie library is empty. Use the Admin Panel to add movies from TMDB and start building your collection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
