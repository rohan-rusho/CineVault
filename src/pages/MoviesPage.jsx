import React from 'react';
import { useMovies, useEnrichedMovies } from '@/hooks/useMovies';
import MovieCard from '@/components/MovieCard/MovieCard';
import { SkeletonCard } from '@/components/SkeletonLoader/SkeletonLoader';
import './MoviesPage.css';

export default function MoviesPage() {
  const { movies, loading } = useMovies();

  return (
    <div className="movies-page">
      <div className="container">
        <header className="movies-page__header">
          <h1 className="movies-page__title">All Movies</h1>
          <p className="movies-page__subtitle">{movies.length} movies in your library</p>
        </header>

        <div className="movies-page__grid">
          {loading ? (
            <SkeletonCard count={12} />
          ) : (
            movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          )}
        </div>

        {!loading && movies.length === 0 && (
          <div className="movies-page__empty">
            <p>No movies in your library yet.</p>
            <span>Use the Admin Panel to add movies.</span>
          </div>
        )}
      </div>
    </div>
  );
}
