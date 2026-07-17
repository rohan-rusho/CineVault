import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import LazyImage from '@/components/common/LazyImage';
import { getTMDBImageUrl, getPosterSrcSet } from '@/utils/imageUtils';
import { formatRating, getYear, formatRuntime } from '@/utils/formatters';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';
import * as tmdbService from '@/services/tmdbService';
import './MovieCard.css';

export default function MovieCard({ movie, progress, showProgress = true }) {
  const navigate = useNavigate();
  const [tmdb, setTmdb] = useState(movie.tmdb || null);

  useEffect(() => {
    if (movie.tmdb) {
      setTmdb(movie.tmdb);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const data = await tmdbService.getMovieDetails(movie.tmdbId);
        if (!cancelled) setTmdb(data);
      } catch { /* silent */ }
    }
    if (movie.tmdbId) load();
    return () => { cancelled = true; };
  }, [movie.tmdbId, movie.tmdb]);

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/play/${movie.id}`);
  };

  const posterPath = tmdb?.poster_path;
  const title = tmdb?.title || movie.title || movie.id;
  const year = getYear(tmdb?.release_date);
  const rating = formatRating(tmdb?.vote_average);
  const runtime = formatRuntime(tmdb?.runtime);
  const genres = tmdb?.genres?.slice(0, 2).map(g => g.name) || [];

  const progressPercent = progress?.watchedPercentage || 0;

  return (
    <div className="movie-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="movie-card__poster">
        <LazyImage
          src={getTMDBImageUrl(posterPath, 'poster', 'large')}
          srcSet={getPosterSrcSet(posterPath)}
          sizes="(max-width: 480px) 115px, (max-width: 768px) 150px, 185px"
          alt={title}
          fallback={PLACEHOLDER_IMAGES.poster}
          className="movie-card__image"
          style={{ aspectRatio: '2 / 3', borderRadius: 'var(--radius-md)' }}
        />

        {/* Hover Overlay */}
        <div className="movie-card__overlay">
          <button className="movie-card__play-btn" onClick={handlePlayClick} aria-label={`Play ${title}`}>
            <Play size={24} fill="currentColor" />
          </button>
          <div className="movie-card__overlay-info">
            <div className="movie-card__overlay-title">{title}</div>
            <div className="movie-card__overlay-meta">
              {year && <span>{year}</span>}
              {rating !== 'NR' && (
                <span className="movie-card__overlay-rating">
                  <Star size={12} fill="currentColor" /> {rating}
                </span>
              )}
              {runtime && <span>{runtime}</span>}
            </div>
            {genres.length > 0 && (
              <div className="movie-card__overlay-genres">
                {genres.map(g => (
                  <span key={g} className="movie-card__genre-tag">{g}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Watch Progress Bar */}
        {showProgress && progressPercent > 0 && progressPercent < 90 && (
          <div className="movie-card__progress">
            <div
              className="movie-card__progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Title below card (mobile) */}
      <div className="movie-card__info">
        <div className="movie-card__title text-truncate">{title}</div>
      </div>
    </div>
  );
}
