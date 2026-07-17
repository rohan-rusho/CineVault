import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Plus, Trash2, Loader } from 'lucide-react';
import * as tmdbService from '@/services/tmdbService';
import * as adminApi from '@/services/adminApiService';
import { getTMDBImageUrl } from '@/utils/imageUtils';
import { formatRating, getYear, formatRuntime, formatDate } from '@/utils/formatters';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';
import { debounce } from '@/utils/debounce';

export default function AdminAddMovie() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [videoSource, setVideoSource] = useState('');
  const [downloadSource, setDownloadSource] = useState('');
  const [featured, setFeatured] = useState(false);
  const [customOrder, setCustomOrder] = useState('');
  const [subtitles, setSubtitles] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounced TMDB search
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await tmdbService.searchMovies(query);
        setSearchResults(results.results || []);
      } catch (err) {
        showToast('Search failed: ' + err.message, 'error');
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  // Auto-search on typing
  useEffect(() => {
    if (step < 3) {
      performSearch(searchQuery);
    }
    return () => performSearch.cancel?.();
  }, [searchQuery, step, performSearch]);

  // Step 1: Manual/Instant Search on Submit (e.g. pressing Enter)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    performSearch.cancel?.();
    setSearching(true);
    try {
      const results = await tmdbService.searchMovies(searchQuery);
      setSearchResults(results.results || []);
    } catch (err) {
      showToast('Search failed: ' + err.message, 'error');
    } finally {
      setSearching(false);
    }
  };

  // Step 2: Select movie
  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);
    try {
      const details = await tmdbService.getMovieDetails(movie.id);
      setTmdbDetails(details);
      setStep(3);
    } catch (err) {
      showToast('Failed to load movie details', 'error');
    }
  };

  // Add subtitle track
  const addSubtitle = () => {
    setSubtitles([...subtitles, { label: '', language: '', src: '' }]);
  };

  const updateSubtitle = (index, field, value) => {
    const updated = [...subtitles];
    updated[index][field] = value;
    setSubtitles(updated);
  };

  const removeSubtitle = (index) => {
    setSubtitles(subtitles.filter((_, i) => i !== index));
  };

  // Step 4: Save
  const handleSave = async () => {
    if (!tmdbDetails) return;

    setSaving(true);
    try {
      const movieData = {
        tmdbId: tmdbDetails.id,
        title: tmdbDetails.title,
        videoSource: videoSource.trim() || undefined,
        downloadSource: downloadSource.trim() || undefined,
        featured,
        customOrder: customOrder ? parseInt(customOrder, 10) : undefined,
        subtitles: subtitles.filter(s => s.src && s.language),
      };

      await adminApi.addMovie(movieData);
      showToast(`"${tmdbDetails.title}" added successfully!`);
      setTimeout(() => navigate('/admin/movies'), 1500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const director = tmdbDetails ? tmdbService.getDirector(tmdbDetails.credits) : null;
  const cast = tmdbDetails ? tmdbService.getTopCast(tmdbDetails.credits, 5) : [];

  return (
    <div>
      <header className="admin-page__header">
        <h1 className="admin-page__title">Add Movie</h1>
        <p className="admin-page__subtitle">Search TMDB and add a movie to your library</p>
      </header>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: step >= s ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)',
            fontWeight: step >= s ? 'var(--weight-semibold)' : 'var(--weight-regular)',
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              background: step >= s ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
              color: step >= s ? 'white' : 'var(--color-text-tertiary)',
            }}>
              {step > s ? <Check size={14} /> : s}
            </div>
            {s === 1 ? 'Search' : s === 2 ? 'Select' : 'Configure'}
          </div>
        ))}
      </div>

      {/* Step 1: Search */}
      {step >= 1 && (
        <div className="admin-form" style={{ marginBottom: 'var(--space-8)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <input
              type="text"
              className="admin-form__input"
              placeholder="Enter movie name... e.g. Avengers Endgame"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="admin-btn admin-btn--primary" disabled={searching}>
              {searching ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && step < 3 && (
            <div className="tmdb-results">
              {searchResults.slice(0, 12).map(movie => (
                <div
                  key={movie.id}
                  className={`tmdb-result-card ${selectedMovie?.id === movie.id ? 'tmdb-result-card--selected' : ''}`}
                  onClick={() => handleSelectMovie(movie)}
                >
                  <img
                    src={movie.poster_path ? getTMDBImageUrl(movie.poster_path, 'poster', 'medium') : PLACEHOLDER_IMAGES.poster}
                    alt={movie.title}
                    loading="lazy"
                  />
                  <div className="tmdb-result-card__info">
                    <div className="tmdb-result-card__title">{movie.title}</div>
                    <div className="tmdb-result-card__year">{getYear(movie.release_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Configure & Save */}
      {step >= 3 && tmdbDetails && (
        <div>
          {/* Metadata Preview */}
          <div className="admin-metadata-preview">
            <h4>📋 TMDB Metadata (Auto-Retrieved)</h4>
            <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
              <img
                src={getTMDBImageUrl(tmdbDetails.poster_path, 'poster', 'medium')}
                alt={tmdbDetails.title}
                style={{ width: 120, borderRadius: 'var(--radius-md)' }}
              />
              <div className="admin-metadata-preview__grid" style={{ flex: 1 }}>
                <div className="admin-metadata-preview__item">
                  <label>Title</label>
                  <span>{tmdbDetails.title}</span>
                </div>
                <div className="admin-metadata-preview__item">
                  <label>TMDB ID</label>
                  <span>{tmdbDetails.id}</span>
                </div>
                <div className="admin-metadata-preview__item">
                  <label>Release Date</label>
                  <span>{formatDate(tmdbDetails.release_date)}</span>
                </div>
                <div className="admin-metadata-preview__item">
                  <label>Runtime</label>
                  <span>{formatRuntime(tmdbDetails.runtime)}</span>
                </div>
                <div className="admin-metadata-preview__item">
                  <label>Rating</label>
                  <span>⭐ {formatRating(tmdbDetails.vote_average)}</span>
                </div>
                <div className="admin-metadata-preview__item">
                  <label>Genres</label>
                  <span>{tmdbDetails.genres?.map(g => g.name).join(', ')}</span>
                </div>
                {director && (
                  <div className="admin-metadata-preview__item">
                    <label>Director</label>
                    <span>{director.name}</span>
                  </div>
                )}
                {cast.length > 0 && (
                  <div className="admin-metadata-preview__item">
                    <label>Top Cast</label>
                    <span>{cast.map(c => c.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Source Form */}
          <div className="admin-form">
            <h4 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
              🎬 Video Configuration
            </h4>

            <div className="admin-form__group">
              <label className="admin-form__label">Google Drive or Direct Video URL (MP4, MKV, etc.) *</label>
              <input
                type="url"
                className="admin-form__input"
                placeholder="Google Drive link OR direct video URL (e.g. https://domain.com/movie.mp4)"
                value={videoSource}
                onChange={(e) => setVideoSource(e.target.value)}
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Download URL (optional)</label>
              <input
                type="url"
                className="admin-form__input"
                placeholder="Direct download link"
                value={downloadSource}
                onChange={(e) => setDownloadSource(e.target.value)}
              />
            </div>

            {/* Subtitles */}
            <div className="admin-form__group">
              <label className="admin-form__label">Subtitles</label>
              {subtitles.map((sub, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <input
                    className="admin-form__input"
                    placeholder="Label (e.g. English)"
                    value={sub.label}
                    onChange={(e) => updateSubtitle(i, 'label', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="admin-form__input"
                    placeholder="Lang (e.g. en)"
                    value={sub.language}
                    onChange={(e) => updateSubtitle(i, 'language', e.target.value)}
                    style={{ width: 80 }}
                  />
                  <input
                    className="admin-form__input"
                    placeholder="URL or /subtitles/file.vtt"
                    value={sub.src}
                    onChange={(e) => updateSubtitle(i, 'src', e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <button className="admin-btn admin-btn--danger" onClick={() => removeSubtitle(i)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button className="admin-btn admin-btn--secondary" onClick={addSubtitle}>
                <Plus size={14} /> Add Subtitle
              </button>
            </div>

            {/* Featured */}
            <div className="admin-form__group">
              <label className="admin-form__checkbox">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Mark as Featured</span>
              </label>
            </div>

            {featured && (
              <div className="admin-form__group">
                <label className="admin-form__label">Custom Order (optional)</label>
                <input
                  type="number"
                  className="admin-form__input"
                  placeholder="1"
                  value={customOrder}
                  onChange={(e) => setCustomOrder(e.target.value)}
                  style={{ width: 120 }}
                />
              </div>
            )}

            {/* Save */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleSave}
                disabled={saving}
                style={{ padding: 'var(--space-3) var(--space-8)' }}
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving...' : 'Save Movie'}
              </button>
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => { setStep(1); setSelectedMovie(null); setTmdbDetails(null); }}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
