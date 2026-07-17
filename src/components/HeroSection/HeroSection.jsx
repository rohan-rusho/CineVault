import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, Clock, Calendar } from 'lucide-react';
import LazyImage from '@/components/common/LazyImage';
import { getTMDBImageUrl, getMovieLogo } from '@/utils/imageUtils';
import { formatRating, getYear, formatRuntime, truncateText } from '@/utils/formatters';
import * as tmdbService from '@/services/tmdbService';
import './HeroSection.css';

export default function HeroSection({ featuredMovies }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [tmdbDataMap, setTmdbDataMap] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load TMDB data for featured movies
  useEffect(() => {
    if (!featuredMovies?.length) return;
    let cancelled = false;

    async function loadAll() {
      const dataMap = {};
      await Promise.allSettled(
        featuredMovies.map(async (movie) => {
          const data = await tmdbService.getMovieDetails(movie.tmdbId);
          dataMap[movie.tmdbId] = data;
        })
      );
      if (!cancelled) setTmdbDataMap(dataMap);
    }
    loadAll();
    return () => { cancelled = true; };
  }, [featuredMovies]);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredMovies?.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % featuredMovies.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredMovies?.length]);

  const goToSlide = useCallback((index) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 400);
  }, [activeIndex]);

  if (!featuredMovies?.length) return null;

  const activeMovie = featuredMovies[activeIndex];
  const tmdb = tmdbDataMap[activeMovie?.tmdbId];
  const logoUrl = tmdb?.images ? getMovieLogo(tmdb) : null;

  const title = tmdb?.title || activeMovie?.title || activeMovie?.id;
  const overview = truncateText(tmdb?.overview, 250);
  const year = getYear(tmdb?.release_date);
  const runtime = formatRuntime(tmdb?.runtime);
  const rating = formatRating(tmdb?.vote_average);
  const genres = tmdb?.genres?.slice(0, 3).map(g => g.name) || [];
  const backdropPath = tmdb?.backdrop_path;

  return (
    <section className="hero">
      {/* Background */}
      <div className={`hero__backdrop ${isTransitioning ? 'hero__backdrop--transitioning' : ''}`}>
        {backdropPath && (
          <img
            src={getTMDBImageUrl(backdropPath, 'backdrop', 'large')}
            alt=""
            className="hero__backdrop-img"
            loading="eager"
          />
        )}
        <div className="hero__gradient-bottom" />
        <div className="hero__gradient-left" />
        <div className="hero__gradient-top" />
      </div>

      {/* Content */}
      <div className={`hero__content container-fluid ${isTransitioning ? 'hero__content--transitioning' : ''}`}>
        {/* Logo or Title */}
        {logoUrl ? (
          <img src={logoUrl} alt={title} className="hero__logo" />
        ) : (
          <h1 className="hero__title">{title}</h1>
        )}

        {/* Meta */}
        <div className="hero__meta">
          {rating !== 'NR' && (
            <span className="hero__meta-item hero__rating">
              <Star size={14} fill="currentColor" /> {rating}
            </span>
          )}
          {year && (
            <span className="hero__meta-item">
              <Calendar size={14} /> {year}
            </span>
          )}
          {runtime && (
            <span className="hero__meta-item">
              <Clock size={14} /> {runtime}
            </span>
          )}
          {genres.map(g => (
            <span key={g} className="hero__genre-badge">{g}</span>
          ))}
        </div>

        {/* Description */}
        {overview && (
          <p className="hero__description">{overview}</p>
        )}

        {/* Actions */}
        <div className="hero__actions">
          <button
            className="hero__btn hero__btn--play"
            onClick={() => navigate(`/play/${activeMovie.id}`)}
          >
            <Play size={20} fill="currentColor" />
            <span>Play</span>
          </button>
          <button
            className="hero__btn hero__btn--info"
            onClick={() => navigate(`/movie/${activeMovie.id}`)}
          >
            <Info size={20} />
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Carousel Dots */}
      {featuredMovies.length > 1 && (
        <div className="hero__dots">
          {featuredMovies.map((_, i) => (
            <button
              key={i}
              className={`hero__dot ${i === activeIndex ? 'hero__dot--active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
