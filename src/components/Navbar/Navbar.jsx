import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, X, Film } from 'lucide-react';
import { NAV_LINKS } from '@/utils/constants';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search expanding states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!searchParams.get('q'));
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync state if query in URL changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
    if (q) setIsSearchExpanded(true);
  }, [searchParams]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearchIconClick = () => {
    if (isSearchExpanded && !searchQuery.trim()) {
      setIsSearchExpanded(false);
    } else {
      setIsSearchExpanded(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      setSearchQuery('');
      navigate('/');
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <a href="/" className="navbar__logo">
          <Film className="navbar__logo-icon" size={28} />
          <span className="navbar__logo-text">CineVault</span>
        </a>

        {/* Desktop Nav */}
        <nav className="navbar__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => 
            link.external ? (
              <a
                key={link.path}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="navbar__link"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Right Actions (with expanding search bar) */}
        <div className="navbar__actions">
          <div className={`navbar__search-bar ${isSearchExpanded ? 'navbar__search-bar--expanded' : ''}`}>
            <button
              className="navbar__search-btn"
              onClick={handleSearchIconClick}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              className="navbar__search-input"
              placeholder="Titles, genres, actors..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                className="navbar__search-clear"
                onClick={() => {
                  setSearchQuery('');
                  navigate('/');
                  searchInputRef.current?.focus();
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${mobileOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <nav className="navbar__mobile-nav">
          {NAV_LINKS.map((link) => 
            link.external ? (
              <a
                key={link.path}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="navbar__mobile-link"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__mobile-link ${location.pathname === link.path ? 'navbar__mobile-link--active' : ''}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
