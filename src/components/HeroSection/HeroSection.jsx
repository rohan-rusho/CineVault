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
  const playerRef = useRef(null);

  // Load YouTube Player API script once on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

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

  // Auto-rotate slides (only if video is paused/not playing)
  useEffect(() => {
    if (featuredMovies?.length <= 1 || !isPlayingVideo) return;
    
    const interval = setInterval(() => {
      handleNextSlide();
    }, 12000); // 12 seconds per slide
    
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

  // Initialize/Update YouTube Player API
  useEffect(() => {
    if (!trailerKey) return;

    let player = null;
    const playerId = `hero-video-${activeMovie.id}`;

    const createPlayer = () => {
      // Ensure the container exists in DOM before rendering
      const el = document.getElementById(playerId);
      if (!el) return;

      player = new window.YT.Player(playerId, {
        videoId: trailerKey,
        playerVars: {
          autoplay: 1,
          mute: isMuted ? 1 : 0,
          loop: 1,
          playlist: trailerKey,
          controls: 0,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unmute();
            }
            if (isPlayingVideo) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.playVideo();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {}
      }
      playerRef.current = null;
    };
  }, [trailerKey, activeMovie.id]);

  // Video Control Functions
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const player = playerRef.current;
    if (player && typeof player.mute === 'function') {
      if (nextMuted) {
        player.mute();
      } else {
        player.unmute();
      }
    }
  };

  const togglePlayVideo = () => {
    const nextPlaying = !isPlayingVideo;
    setIsPlayingVideo(nextPlaying);
    const player = playerRef.current;
    if (player && typeof player.playVideo === 'function') {
      if (nextPlaying) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    }
  };

  return (
    <section className="hero">
      {/* Background (Video API or Image) */}
      <div className={`hero__backdrop ${isTransitioning ? 'hero__backdrop--transitioning' : ''}`}>
        {isPlayingVideo && trailerKey ? (
          <div className="hero__video-wrapper">
            <div id={`hero-video-${activeMovie.id}`} className="hero__video-iframe" />
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

      {/* Side Carousel Navigation */}
      {featuredMovies.length > 1 && (
        <>
          <button className="hero__arrow hero__arrow--left" onClick={handlePrevSlide} aria-label="Previous Slide">
            <ChevronLeft size={32} />
          </button>
          <button className="hero__arrow hero__arrow--right" onClick={handleNextSlide} aria-label="Next Slide">
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Center Play/Pause overlay */}
      {trailerKey && (
        <div className="hero__play-pause-overlay">
          <button className="hero__play-pause-btn" onClick={togglePlayVideo} aria-label="Play/Pause Trailer">
            {isPlayingVideo ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
        </div>
      )}

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
