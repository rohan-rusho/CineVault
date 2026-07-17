import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, PlusCircle, Settings } from 'lucide-react';
import * as adminApi from '@/services/adminApiService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movieCount: 0, featuredCount: 0 });

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getMovies();
        const movies = data.movies || [];
        setStats({
          movieCount: movies.length,
          featuredCount: movies.filter(m => m.featured).length,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    }
    load();
  }, []);

  return (
    <div>
      <header className="admin-page__header">
        <h1 className="admin-page__title">Dashboard</h1>
        <p className="admin-page__subtitle">Manage your CineVault movie library</p>
      </header>

      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Total Movies</div>
          <div className="admin-stat-card__value">{stats.movieCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Featured</div>
          <div className="admin-stat-card__value">{stats.featuredCount}</div>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
        Quick Actions
      </h3>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Link to="/admin/add" className="admin-btn admin-btn--primary">
          <PlusCircle size={16} /> Add Movie
        </Link>
        <Link to="/admin/movies" className="admin-btn admin-btn--secondary">
          <Film size={16} /> View All Movies
        </Link>
        <Link to="/admin/settings" className="admin-btn admin-btn--secondary">
          <Settings size={16} /> Settings
        </Link>
      </div>
    </div>
  );
}
