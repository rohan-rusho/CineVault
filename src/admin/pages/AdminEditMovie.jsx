import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Trash2, Plus, Loader, ArrowLeft } from 'lucide-react';
import * as adminApi from '@/services/adminApiService';
import * as tmdbService from '@/services/tmdbService';
import { getTMDBImageUrl } from '@/utils/imageUtils';
import { formatRating, getYear, formatRuntime } from '@/utils/formatters';

export default function AdminEditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [tmdb, setTmdb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getMovies();
        const found = data.movies?.find(m => m.id === id);
        if (!found) {
          showToast('Movie not found', 'error');
          navigate('/admin/movies');
          return;
        }
        setMovie(found);
        const details = await tmdbService.getMovieDetails(found.tmdbId);
        setTmdb(details);
      } catch (err) {
        showToast('Failed to load movie', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleChange = (field, value) => {
    setMovie(prev => ({ ...prev, [field]: value }));
  };

  const handleSubtitleChange = (index, field, value) => {
    const subs = [...(movie.subtitles || [])];
    subs[index] = { ...subs[index], [field]: value };
    handleChange('subtitles', subs);
  };

  const addSubtitle = () => {
    handleChange('subtitles', [...(movie.subtitles || []), { label: '', language: '', src: '' }]);
  };

  const removeSubtitle = (index) => {
    handleChange('subtitles', (movie.subtitles || []).filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateMovie(id, movie);
      showToast('Movie updated!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshMetadata = async () => {
    try {
      tmdbService.clearMovieCache(movie.tmdbId);
      const details = await tmdbService.getMovieDetails(movie.tmdbId);
      setTmdb(details);
      showToast('Metadata refreshed');
    } catch (err) {
      showToast('Refresh failed', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <Loader size={32} className="animate-spin" style={{ color: 'var(--color-accent-primary)' }} />
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div>
      <button className="admin-btn admin-btn--secondary" onClick={() => navigate('/admin/movies')} style={{ marginBottom: 'var(--space-5)' }}>
        <ArrowLeft size={14} /> Back to Movies
      </button>

      <header className="admin-page__header">
        <h1 className="admin-page__title">Edit: {tmdb?.title || movie.id}</h1>
      </header>

      {/* TMDB Info */}
      {tmdb && (
        <div className="admin-metadata-preview">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>TMDB Metadata</h4>
            <button className="admin-btn admin-btn--secondary" onClick={handleRefreshMetadata}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
            <img
              src={getTMDBImageUrl(tmdb.poster_path, 'poster', 'small')}
              alt=""
              style={{ width: 80, borderRadius: 'var(--radius-md)' }}
            />
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <div><strong>{tmdb.title}</strong> ({getYear(tmdb.release_date)})</div>
              <div>⭐ {formatRating(tmdb.vote_average)} · {formatRuntime(tmdb.runtime)}</div>
              <div>{tmdb.genres?.map(g => g.name).join(', ')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="admin-form">
        <div className="admin-form__group">
          <label className="admin-form__label">Video Source URL</label>
          <input
            className="admin-form__input"
            value={movie.videoSource || ''}
            onChange={(e) => handleChange('videoSource', e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Download URL</label>
          <input
            className="admin-form__input"
            value={movie.downloadSource || ''}
            onChange={(e) => handleChange('downloadSource', e.target.value)}
            placeholder="Optional download link"
          />
        </div>

        {/* Subtitles */}
        <div className="admin-form__group">
          <label className="admin-form__label">Subtitles</label>
          {(movie.subtitles || []).map((sub, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <input className="admin-form__input" placeholder="Label" value={sub.label} onChange={(e) => handleSubtitleChange(i, 'label', e.target.value)} style={{ flex: 1 }} />
              <input className="admin-form__input" placeholder="Lang" value={sub.language} onChange={(e) => handleSubtitleChange(i, 'language', e.target.value)} style={{ width: 80 }} />
              <input className="admin-form__input" placeholder="Source URL" value={sub.src} onChange={(e) => handleSubtitleChange(i, 'src', e.target.value)} style={{ flex: 2 }} />
              <button className="admin-btn admin-btn--danger" onClick={() => removeSubtitle(i)}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={addSubtitle}>
            <Plus size={14} /> Add Subtitle
          </button>
        </div>

        <div className="admin-form__group">
          <label className="admin-form__checkbox">
            <input type="checkbox" checked={movie.featured || false} onChange={(e) => handleChange('featured', e.target.checked)} />
            <span>Featured</span>
          </label>
        </div>

        {movie.featured && (
          <div className="admin-form__group">
            <label className="admin-form__label">Custom Order</label>
            <input
              type="number"
              className="admin-form__input"
              value={movie.customOrder || ''}
              onChange={(e) => handleChange('customOrder', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: 120 }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving} style={{ padding: 'var(--space-3) var(--space-8)' }}>
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
