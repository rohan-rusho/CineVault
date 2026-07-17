import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, Info, Star, Clock, Calendar,
  Volume2, VolumeX, ChevronLeft, ChevronRight
} from 'lucide-react';
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
  
  // Background Video State
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const iframeRef = useRef(null);

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

  // Auto-rotate slides (only if video is paused/not playing or not supported)
  useEffect(() => {
    if (featuredMovies?.length <= 1 || !isPlayingVideo) return;
    
    const interval = setInterval(() => {
      handleNextSlide();
    }, 12000); // 12 seconds per slide to allow trailer visibility
    
    return () => clearInterval(interval);
  }, [featuredMovies?.length, isPlayingVideo]);

  const handlePrevSlide = useCallback(() => {
    setIsTransitioning(true);
    setShowFullDesc(false);
    setIsPlayingVideo(true);
    setTimeout(() => {
      setActiveIndex(prev => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 450);
  }, [featuredMovies]);

  const handleNextSlide = useCallback(() => {
    setIsTransitioning(true);
    setShowFullDesc(false);
    setIsPlayingVideo(true);
    setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % featuredMovies.length);
      setIsTransitioning(false);
    }, 450);
  }, [featuredMovies]);

  const goToSlide = useCallback((index) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setShowFullDesc(false);
    setIsPlayingVideo(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 450);
  }, [activeIndex]);

  // Video Control Helpers
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      const command = nextMuted ? 'mute' : 'unmute';
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    }
  };

  const togglePlayVideo = () => {
    const nextPlaying = !isPlayingVideo;
    setIsPlayingVideo(nextPlaying);
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      const command = nextPlaying ? 'playVideo' : 'pauseVideo';
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    }
  };

  if (!featuredMovies?.length) return null;

  const activeMovie = featuredMovies[activeIndex];
  const tmdb = tmdbDataMap[activeMovie?.tmdbId];
  const logoUrl = tmdb?.images ? getMovieLogo(tmdb) : null;

  const title = tmdb?.title || activeMovie?.title || activeMovie?.id;
  const rawOverview = tmdb?.overview || '';
  const overview = showFullDesc ? rawOverview : truncateText(rawOverview, 180);
  const year = getYear(tmdb?.release_date);
  const runtime = formatRuntime(tmdb?.runtime);
  const rating = formatRating(tmdb?.vote_average);
  const genres = tmdb?.genres?.slice(0, 3).map(g => g.name) || [];
  const backdropPath = tmdb?.backdrop_path;

  // Retrieve certification
  const certification = tmdb ? tmdbService.getCertification(tmdb.release_dates) : null;

  // Get YouTube trailer ID
  const videos = tmdb?.videos?.results;
  const trailer = videos?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos?.find(v => v.site === 'YouTube');
  const trailerKey = trailer?.key;

  return (
    <section className="hero">
      {/* Background (Video or Image) */}
      <div className={`hero__backdrop ${isTransitioning ? 'hero__backdrop--transitioning' : ''}`}>
        {isPlayingVideo && trailerKey ? (
          <div className="hero__video-wrapper">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&playlist=${trailerKey}&loop=1&controls=0&showinfo=0&rel=0&enablejsapi=1&iv_load_policy=3&playsinline=1&modestbranding=1`}
              title="Movie Trailer"
              className="hero__video-iframe"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          backdropPath && (
            <img
              src={getTMDBImageUrl(backdropPath, 'backdrop', 'original')}
              alt=""
              className="hero__backdrop-img"
              loading="eager"
            />
          )
        )}
        <div className="hero__gradient-bottom" />
        <div className="hero__gradient-left" />
        <div className="hero__gradient-top" />
      </div>

      {/* Center Carousel Controls (from inspiration) */}
      <div className="hero__center-controls">
        <button className="hero__center-btn" onClick={handlePrevSlide} aria-label="Previous Slide">
          <ChevronLeft size={36} />
        </button>
        <button className="hero__center-btn hero__center-btn--play" onClick={togglePlayVideo} aria-label="Play/Pause Trailer">
          {isPlayingVideo ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
        </button>
        <button className="hero__center-btn" onClick={handleNextSlide} aria-label="Next Slide">
          <ChevronRight size={36} />
        </button>
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
          <p className="hero__description">
            {overview}
            {rawOverview.length > 180 && (
              <button className="hero__read-more" onClick={() => setShowFullDesc(!showFullDesc)}>
                {showFullDesc ? ' Show Less' : ' Read More'}
              </button>
            )}
          </p>
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

      {/* Bottom Right Controls (Volume + Certification) */}
      <div className="hero__right-overlays">
        {trailerKey && (
          <button className="hero__volume-btn" onClick={toggleMute} aria-label="Toggle Sound">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        )}
        {certification && (
          <span className="hero__cert-badge">{certification}</span>
        )}
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
