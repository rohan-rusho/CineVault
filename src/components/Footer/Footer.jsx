import React from 'react';
import { Github, Film, Heart } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__logo">
          <Film size={20} className="footer__logo-icon" />
          <span>CineVault</span>
        </div>
        
        <p className="footer__text">
          Made with <Heart size={14} className="footer__heart-icon" fill="currentColor" /> by{' '}
          <a href="https://github.com/rohan-rusho" target="_blank" rel="noopener noreferrer" className="footer__link">
            Rohan Rusho
          </a>
        </p>

        <div className="footer__socials">
          <a href="https://github.com/rohan-rusho" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="GitHub">
            <Github size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
