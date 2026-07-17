import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import * as catalogService from '@/services/movieCatalogService';
import * as tmdbService from '@/services/tmdbService';
import { Loader } from 'lucide-react';

export default function PlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState(null);
  const [tmdb, setTmdb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialTime = parseInt(searchParams.get('t') || '0', 10);

  useEffect(() => {
    async function load() {
      try {
        const movieData = await catalogService.getMovieById(id);
        if (!movieData) {
          setError('Movie not found');
          setLoading(false);
          return;
        }
        setMovie(movieData);

        const tmdbData = await tmdbService.getMovieDetails(movieData.tmdbId);
        setTmdb(tmdbData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader size={40} className="animate-spin" style={{ color: 'var(--color-accent-primary)' }} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-fallback">
        <h2>Unable to Play</h2>
        <p>{error || 'Movie data not found.'}</p>
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

  if (!movie.videoSource) {
    return (
      <div className="error-fallback">
        <h2>No Video Source</h2>
        <p>This movie doesn't have a video source configured yet.</p>
        <button
          onClick={() => navigate(`/movie/${id}`)}
          style={{
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          Back to Details
        </button>
      </div>
    );
  }

  return (
    <VideoPlayer
      movieId={id}
      videoSource={movie.videoSource}
      subtitles={movie.subtitles || []}
      downloadUrl={movie.downloadSource}
      title={tmdb?.title || movie.title || id}
      onBack={() => navigate(`/movie/${id}`)}
      initialTime={initialTime}
    />
  );
}
