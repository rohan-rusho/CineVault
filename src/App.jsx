import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar/Navbar';
import SearchModal from '@/components/SearchModal/SearchModal';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { useSearch } from '@/hooks/useSearch';
import { Loader } from 'lucide-react';
import '@/styles/index.css';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const MoviesPage = lazy(() => import('@/pages/MoviesPage'));
const MovieDetailPage = lazy(() => import('@/pages/MovieDetailPage'));
const CollectionsPage = lazy(() => import('@/pages/CollectionsPage'));
const PlayerPage = lazy(() => import('@/pages/PlayerPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin — lazy loaded
const AdminApp = lazy(() => import('@/admin/AdminApp'));

function PageLoader() {
  return (
    <div className="loading-screen">
      <Loader size={36} className="animate-spin" style={{ color: 'var(--color-accent-primary)' }} />
    </div>
  );
}

function AppContent() {
  const search = useSearch();
  const location = useLocation();

  // Hide navbar on player page and admin
  const isPlayerPage = location.pathname.startsWith('/play/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const showNavbar = !isPlayerPage && !isAdminPage;

  return (
    <>
      {showNavbar && <Navbar onSearchOpen={search.open} />}

      <SearchModal
        isOpen={search.isOpen}
        query={search.query}
        results={search.results}
        loading={search.loading}
        onSearch={search.search}
        onClose={search.close}
      />

      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/play/:id" element={<PlayerPage />} />
              {import.meta.env.DEV && (
                <Route path="/admin/*" element={<AdminApp />} />
              )}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
