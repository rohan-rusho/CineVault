import React from 'react';
import { Film } from 'lucide-react';

export default function CollectionsPage() {
  return (
    <div className="collections-page" style={{
      paddingTop: 'calc(var(--navbar-height) + var(--space-8))',
      minHeight: '100vh',
    }}>
      <div className="container">
        <h1 style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-bold)',
          marginBottom: 'var(--space-8)',
        }}>
          Collections
        </h1>

        <div style={{
          textAlign: 'center',
          padding: 'var(--space-16) 0',
          color: 'var(--color-text-tertiary)',
        }}>
          <Film size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            No collections yet
          </p>
          <span>Collections will appear here as you add movies that belong to franchises.</span>
        </div>
      </div>
    </div>
  );
}
