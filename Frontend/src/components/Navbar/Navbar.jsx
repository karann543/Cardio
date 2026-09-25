import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="CardioPredict Home">
          <span className="navbar__logo-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="currentColor"/>
            </svg>
          </span>
          <span className="navbar__logo-text">CardioPredict</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink to="/" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`} end>
            Dashboard
          </NavLink>
          <NavLink to="/comparison" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            Model Comparison
          </NavLink>
          <NavLink to="/details" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            Model Details
          </NavLink>
          <NavLink to="/prediction" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            Prediction
          </NavLink>
        </nav>

        {/* CTA */}
        <NavLink to="/prediction" className="navbar__cta">
          Predict Disease
        </NavLink>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile-menu${menuOpen ? ' navbar__mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          <NavLink to="/" className={({ isActive }) => `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`} end>
            Dashboard
          </NavLink>
          <NavLink to="/comparison" className={({ isActive }) => `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`}>
            Model Comparison
          </NavLink>
          <NavLink to="/details" className={({ isActive }) => `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`}>
            Model Details
          </NavLink>
          <NavLink to="/prediction" className={({ isActive }) => `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`}>
            Prediction
          </NavLink>
          <NavLink to="/prediction" className="navbar__mobile-cta">
            Predict Disease
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
