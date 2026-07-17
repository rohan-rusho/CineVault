import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-fallback">
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>🎬</div>
          <h2>Something went wrong</h2>
          <p>
            {this.state.error?.message || 'An unexpected error occurred while loading this content.'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-accent-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--color-accent-primary-hover)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--color-accent-primary)'}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
