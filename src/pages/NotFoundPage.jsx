import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Film } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="error-fallback" style={{ minHeight: '100vh' }}>
      <Film size={64} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)', opacity: 0.3 }} />
      <h2 style={{ fontSize: 'var(--text-4xl)' }}>404</h2>
      <p style={{ fontSize: 'var(--text-lg)' }}>This page doesn't exist in your library.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-6)',
          background: 'var(--color-accent-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-base)',
          marginTop: 'var(--space-4)',
        }}
      >
        <Home size={18} /> Go Home
      </button>
    </div>
  );
}
