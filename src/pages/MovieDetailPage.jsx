import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Download, Star, Clock, Calendar, Tag, Globe, Building2,
  ChevronLeft, Loader, AlertCircle, RotateCcw
} from 'lucide-react';
import { useMovieDetails, useRelatedMovies } from '@/hooks/useMovieDetails';
import { useWatchProgress } from '@/hooks/useWatchHistory';
import CastSection from '@/components/CastSection/CastSection';
import MovieRow from '@/components/MovieRow/MovieRow';
import LazyImage from '@/components/common/LazyImage';
import { SkeletonDetail } from '@/components/SkeletonLoader/SkeletonLoader';
import { getTMDBImageUrl, getMovieLogo } from '@/utils/imageUtils';
import { formatRating, getYear, formatRuntime, formatDate, formatTime, formatVoteCount } from '@/utils/formatters';
import { getGoogleDriveDownloadUrl } from '@/services/videoSourceService';
import './MovieDetailPage.css';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { catalogData, tmdbData, director, writers, cast, certification, trailerUrl, loading, error } = useMovieDetails(id);
  const { collectionMovies, similarMovies } = useRelatedMovies(tmdbData);
  const { progress } = useWatchProgress(id);

  if (loading) return <SkeletonDetail />;

  if (error || !tmdbData) {
    return (
      <div className="error-fallback">
        <AlertCircle size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }} />
        <h2>Movie Not Found</h2>
        <p>{error || 'This movie could not be loaded.'}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  const title = tmdbData.title;
  const overview = tmdbData.overview;
  const year = getYear(tmdbData.release_date);
  const runtime = formatRuntime(tmdbData.runtime);
  const rating = formatRating(tmdbData.vote_average);
  const voteCount = formatVoteCount(tmdbData.vote_count);
  const genres = tmdbData.genres || [];
  const logoUrl = tmdbData.images ? getMovieLogo(tmdbData) : null;
  const backdropPath = tmdbData.backdrop_path;

  const hasProgress = progress && progress.currentTime > 60 && !progress.isCompleted;
  const downloadUrl = catalogData?.downloadSource || getGoogleDriveDownloadUrl(catalogData?.videoSource);

  const productionCompanies = tmdbData.production_companies?.map(c => c.name).join(', ');
  const productionCountries = tmdbData.production_countries?.map(c => c.name).join(', ');
  const spokenLanguages = tmdbData.spoken_languages?.map(l => l.english_name).join(', ');
  const writerNames = writers?.map(w => w.name).join(', ');

  return (
    <div className="movie-detail">
      {/* Backdrop */}
      <div className="movie-detail__backdrop">
        {backdropPath && (
          <img
            src={getTMDBImageUrl(backdropPath, 'backdrop', 'large')}
            alt=""
            className="movie-detail__backdrop-img"
            loading="eager"
          />
        )}
        <div className="movie-detail__backdrop-gradient" />
      </div>

      {/* Back Button */}
      <button className="movie-detail__back" onClick={() => navigate(-1)}>
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      {/* Main Content */}
      <div className="movie-detail__content container">
        <div className="movie-detail__hero">
          {/* Logo or Title */}
          {logoUrl ? (
            <img src={logoUrl} alt={title} className="movie-detail__logo animate-fade-in-up" />
          ) : (
            <h1 className="movie-detail__title animate-fade-in-up">{title}</h1>
          )}

          {/* Meta */}
          <div className="movie-detail__meta animate-fade-in-up stagger-1">
            {certification && <span className="movie-detail__cert">{certification}</span>}
            {rating !== 'NR' && (
              <span className="movie-detail__rating">
                <Star size={14} fill="currentColor" /> {rating}
                <span className="movie-detail__vote-count">({voteCount})</span>
              </span>
            )}
            {year && <span><Calendar size={14} /> {year}</span>}
            {runtime && <span><Clock size={14} /> {runtime}</span>}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="movie-detail__genres animate-fade-in-up stagger-2">
              {genres.map(g => (
                <span key={g.id} className="badge">{g.name}</span>
              ))}
            </div>
          )}

          {/* Overview */}
          {overview && (
            <p className="movie-detail__overview animate-fade-in-up stagger-3">{overview}</p>
          )}

          {/* Actions */}
          <div className="movie-detail__actions animate-fade-in-up stagger-4">
            <button
              className="movie-detail__btn movie-detail__btn--play"
              onClick={() => navigate(`/play/${id}`)}
            >
              <Play size={20} fill="currentColor" /> Play
            </button>

            {hasProgress && (
              <button
                className="movie-detail__btn movie-detail__btn--resume"
                onClick={() => navigate(`/play/${id}?t=${Math.floor(progress.currentTime)}`)}
              >
                <RotateCcw size={18} />
                Resume from {formatTime(progress.currentTime)}
              </button>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                className="movie-detail__btn movie-detail__btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={18} /> Download
              </a>
            )}
          </div>
        </div>

        {/* Cast */}
        <CastSection cast={cast} />

        {/* Additional Info */}
        <section className="movie-detail__info-section">
          <h3 className="movie-detail__section-title">Details</h3>
          <div className="movie-detail__info-grid">
            {director && (
              <div className="movie-detail__info-item">
                <span className="movie-detail__info-label">Director</span>
                <span className="movie-detail__info-value">{director.name}</span>
              </div>
            )}
            {writerNames && (
              <div className="movie-detail__info-item">
                <span className="movie-detail__info-label">Writers</span>
                <span className="movie-detail__info-value">{writerNames}</span>
              </div>
            )}
            {tmdbData.release_date && (
              <div className="movie-detail__info-item">
                <span className="movie-detail__info-label">Release Date</span>
                <span className="movie-detail__info-value">{formatDate(tmdbData.release_date)}</span>
              </div>
            )}
            {productionCompanies && (
              <div className="movie-detail__info-item">
                <span className="movie-detail__info-label">Production</span>
                <span className="movie-detail__info-value">{productionCompanies}</span>
              </div>
            )}
            {productionCountries && (
              <div className="movie-detail__info-item">
                <span className="movie-detail__info-label">Countries</span>
                <span className="movie-detail__info-value">{productionCountries}</span>
              </div>
            )}
            {spokenLanguages && (
              <div className="movie-detail__info-item">
                <span className="movie-detail__info-label">Languages</span>
                <span className="movie-detail__info-value">{spokenLanguages}</span>
              </div>
            )}
          </div>
        </section>

        {/* Collection */}
        {collectionMovies.length > 0 && (
          <MovieRow
            title={`More from ${tmdbData.belongs_to_collection?.name || 'Collection'}`}
            movies={collectionMovies.map(m => m.catalogEntry)}
          />
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <MovieRow
            title="You May Also Like"
            movies={similarMovies.map(m => m.catalogEntry)}
          />
        )}
      </div>
    </div>
  );
}
