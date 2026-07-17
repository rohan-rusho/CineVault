import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '@/components/MovieCard/MovieCard';
import './MovieRow.css';

export default function MovieRow({ title, movies, progressMap = {} }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Don't render empty rows
  if (!movies?.length) return null;

  const checkArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkArrows();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkArrows, { passive: true });
      window.addEventListener('resize', checkArrows);
    }
    return () => {
      el?.removeEventListener('scroll', checkArrows);
      window.removeEventListener('resize', checkArrows);
    };
  }, [movies]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="movie-row">
      <div className="movie-row__header container-fluid">
        <h2 className="movie-row__title">{title}</h2>
      </div>

      <div className="movie-row__container">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            className="movie-row__arrow movie-row__arrow--left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Scrollable Cards */}
        <div className="movie-row__scroll hide-scrollbar" ref={scrollRef}>
          <div className="movie-row__spacer" />
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              progress={progressMap[movie.id]}
            />
          ))}
          <div className="movie-row__spacer" />
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            className="movie-row__arrow movie-row__arrow--right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
}
