import React from 'react';

export function SkeletonCard({ count = 1 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="skeleton-card">
      <div className="skeleton skeleton-poster" />
      <div className="skeleton-card-info">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-meta" />
      </div>
      <style>{`
        .skeleton-card {
          flex-shrink: 0;
          width: var(--card-width-lg);
        }
        .skeleton-poster {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: var(--radius-md);
        }
        .skeleton-card-info {
          padding: var(--space-2) 0;
        }
        .skeleton-title {
          height: 14px;
          width: 80%;
          margin-bottom: var(--space-1);
        }
        .skeleton-meta {
          height: 12px;
          width: 50%;
        }
      `}</style>
    </div>
  ));
}

export function SkeletonHero() {
  return (
    <div className="skeleton-hero">
      <div className="skeleton skeleton-hero-bg" />
      <div className="skeleton-hero-content">
        <div className="skeleton skeleton-hero-title" />
        <div className="skeleton skeleton-hero-desc" />
        <div className="skeleton skeleton-hero-desc short" />
        <div className="skeleton-hero-actions">
          <div className="skeleton skeleton-hero-btn" />
          <div className="skeleton skeleton-hero-btn secondary" />
        </div>
      </div>
      <style>{`
        .skeleton-hero {
          position: relative;
          width: 100%;
          height: 80vh;
          min-height: 500px;
          max-height: 800px;
        }
        .skeleton-hero-bg {
          position: absolute;
          inset: 0;
          border-radius: 0;
        }
        .skeleton-hero-content {
          position: absolute;
          bottom: 15%;
          left: var(--container-padding);
          z-index: 2;
        }
        .skeleton-hero-title {
          width: 350px;
          max-width: 60vw;
          height: 48px;
          margin-bottom: var(--space-4);
        }
        .skeleton-hero-desc {
          width: 500px;
          max-width: 50vw;
          height: 16px;
          margin-bottom: var(--space-2);
        }
        .skeleton-hero-desc.short {
          width: 300px;
          max-width: 35vw;
          margin-bottom: var(--space-6);
        }
        .skeleton-hero-actions {
          display: flex;
          gap: var(--space-3);
        }
        .skeleton-hero-btn {
          width: 140px;
          height: 48px;
          border-radius: var(--radius-md);
        }
        .skeleton-hero-btn.secondary {
          width: 160px;
        }
      `}</style>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div className="skeleton skeleton-row-title" />
      <div className="skeleton-row-cards">
        <SkeletonCard count={7} />
      </div>
      <style>{`
        .skeleton-row {
          padding: var(--space-4) 0;
        }
        .skeleton-row-title {
          width: 200px;
          height: 24px;
          margin-bottom: var(--space-4);
          margin-left: var(--container-padding);
        }
        .skeleton-row-cards {
          display: flex;
          gap: var(--card-gap);
          padding: 0 var(--container-padding);
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="skeleton-detail">
      <div className="skeleton skeleton-detail-backdrop" />
      <div className="skeleton-detail-content">
        <div className="skeleton skeleton-detail-title" />
        <div className="skeleton skeleton-detail-meta" />
        <div className="skeleton skeleton-detail-overview" />
        <div className="skeleton skeleton-detail-overview short" />
      </div>
      <style>{`
        .skeleton-detail {
          min-height: 100vh;
        }
        .skeleton-detail-backdrop {
          width: 100%;
          height: 60vh;
          border-radius: 0;
        }
        .skeleton-detail-content {
          padding: var(--space-8) var(--container-padding);
        }
        .skeleton-detail-title {
          width: 300px;
          height: 36px;
          margin-bottom: var(--space-4);
        }
        .skeleton-detail-meta {
          width: 250px;
          height: 18px;
          margin-bottom: var(--space-6);
        }
        .skeleton-detail-overview {
          width: 100%;
          max-width: 600px;
          height: 16px;
          margin-bottom: var(--space-2);
        }
        .skeleton-detail-overview.short {
          width: 60%;
        }
      `}</style>
    </div>
  );
}
