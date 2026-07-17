import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Play, Star, Loader } from 'lucide-react';
import LazyImage from '@/components/common/LazyImage';
import { getTMDBImageUrl } from '@/utils/imageUtils';
import { formatRating, getYear } from '@/utils/formatters';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';
import './SearchModal.css';

export default function SearchModal({ isOpen, query, results, loading, onSearch, onClose }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMovieClick = (movie) => {
    onClose();
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayClick = (e, movie) => {
    e.stopPropagation();
    onClose();
    navigate(`/play/${movie.id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal" onClick={onClose}>
      <div className="search-modal__container" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="search-modal__input-wrapper">
          <Search size={20} className="search-modal__input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal__input"
            placeholder="Search movies, actors, genres..."
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-modal__clear" onClick={() => onSearch('')}>
              <X size={18} />
            </button>
          )}
          <button className="search-modal__close-btn" onClick={onClose}>
            <kbd>ESC</kbd>
          </button>
        </div>

        {/* Results */}
        <div className="search-modal__results">
          {loading && (
            <div className="search-modal__loading">
              <Loader size={24} className="animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="search-modal__empty">
              <p>No movies found for "{query}"</p>
              <span>Try a different search term</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-modal__list">
              {results.map((movie) => {
                const tmdb = movie.tmdb;
                return (
                  <div
                    key={movie.id}
                    className="search-result"
                    onClick={() => handleMovieClick(movie)}
                    role="button"
                    tabIndex={0}
                  >
                    <LazyImage
                      src={getTMDBImageUrl(tmdb?.poster_path, 'poster', 'small')}
                      alt={tmdb?.title || movie.id}
                      fallback={PLACEHOLDER_IMAGES.poster}
                      className="search-result__poster"
                      style={{ width: 50, height: 75, borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                    />
                    <div className="search-result__info">
                      <div className="search-result__title">{tmdb?.title || movie.id}</div>
                      <div className="search-result__meta">
                        {getYear(tmdb?.release_date) && <span>{getYear(tmdb?.release_date)}</span>}
                        {tmdb?.vote_average > 0 && (
                          <span className="search-result__rating">
                            <Star size={11} fill="currentColor" /> {formatRating(tmdb?.vote_average)}
                          </span>
                        )}
                        {tmdb?.genres?.slice(0, 2).map(g => (
                          <span key={g.id} className="search-result__genre">{g.name}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="search-result__play"
                      onClick={(e) => handlePlayClick(e, movie)}
                      aria-label="Play"
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="search-modal__hint">
              <p>Start typing to search your library</p>
              <span>Search by title, actor, genre, or year</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
