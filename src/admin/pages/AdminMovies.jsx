import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Star, RefreshCw, PlusCircle, Search, Loader } from 'lucide-react';
import * as adminApi from '@/services/adminApiService';
import * as tmdbService from '@/services/tmdbService';
import { getTMDBImageUrl } from '@/utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';

export default function AdminMovies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [tmdbCache, setTmdbCache] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMovies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMovies();
      setMovies(data.movies || []);

      // Load TMDB data for all movies
      const cache = {};
      await Promise.allSettled(
        (data.movies || []).map(async (m) => {
          const tmdb = await tmdbService.getMovieDetails(m.tmdbId);
          cache[m.tmdbId] = tmdb;
        })
      );
      setTmdbCache(cache);
    } catch (err) {
      showToast('Failed to load movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMovies(); }, []);

  const handleDelete = async (movie) => {
    const title = tmdbCache[movie.tmdbId]?.title || movie.id;
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await adminApi.deleteMovie(movie.id);
      showToast(`"${title}" deleted`);
      loadMovies();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleToggleFeatured = async (movie) => {
    try {
      await adminApi.updateMovie(movie.id, { ...movie, featured: !movie.featured });
      showToast(`Featured ${!movie.featured ? 'enabled' : 'disabled'}`);
      loadMovies();
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const filteredMovies = movies.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = tmdbCache[m.tmdbId]?.title || m.title || m.id;
    return title.toLowerCase().includes(q) || m.id.includes(q);
  });

  return (
    <div>
      <header className="admin-page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="admin-page__title">Movies</h1>
            <p className="admin-page__subtitle">{movies.length} movies in library</p>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={() => navigate('/admin/add')}>
            <PlusCircle size={16} /> Add Movie
          </button>
        </div>
      </header>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            className="admin-form__input"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <Loader size={32} className="animate-spin" style={{ color: 'var(--color-accent-primary)' }} />
        </div>
      ) : (
        <table className="admin-movie-table">
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>TMDB ID</th>
              <th>Featured</th>
              <th>Video</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.map(movie => {
              const tmdb = tmdbCache[movie.tmdbId];
              return (
                <tr key={movie.id}>
                  <td>
                    <img
                      src={tmdb?.poster_path ? getTMDBImageUrl(tmdb.poster_path, 'poster', 'small') : PLACEHOLDER_IMAGES.poster}
                      alt=""
                      className="admin-movie-table__poster"
                    />
                  </td>
                  <td style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>
                    {tmdb?.title || movie.title || movie.id}
                  </td>
                  <td>{movie.tmdbId}</td>
                  <td>
                    <button
                      onClick={() => handleToggleFeatured(movie)}
                      style={{ color: movie.featured ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }}
                    >
                      <Star size={18} fill={movie.featured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: movie.videoSource ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: movie.videoSource ? 'var(--color-success)' : 'var(--color-danger)',
                    }}>
                      {movie.videoSource ? 'Set' : 'Missing'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-movie-table__actions">
                      <button className="admin-btn admin-btn--secondary" onClick={() => navigate(`/admin/edit/${movie.id}`)}>
                        <Edit size={14} />
                      </button>
                      <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(movie)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!loading && filteredMovies.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-tertiary)' }}>
          {search ? 'No movies match your search.' : 'No movies yet. Click "Add Movie" to get started.'}
        </div>
      )}

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
