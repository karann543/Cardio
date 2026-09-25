import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  GitCompare,
  FlaskConical,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { checkHealthStatus } from '../../services/api';
import './Sidebar.css';

function Sidebar() {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      try {
        setChecking(true);
        const res = await checkHealthStatus();
        if (isMounted) {
          setIsOnline(res && res.status === 'healthy');
        }
      } catch (err) {
        if (isMounted) setIsOnline(false);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000); // Poll health status silently every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="mobile-navbar">
        <NavLink to="/" className="mobile-brand">
          <div className="brand-icon-box">
            <Activity className="brand-icon" size={20} />
          </div>
          <span className="brand-name">CardioLens</span>
        </NavLink>
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Persistent Desktop Sidebar & Mobile Drawer */}
      <aside className={`sidebar-container ${mobileOpen ? 'sidebar-container--open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <NavLink to="/" className="brand-link">
            <div className="brand-icon-box">
              <Activity className="brand-icon" size={22} />
            </div>
            <div className="brand-text-group">
              <span className="brand-title">CardioLens</span>
              <span className="brand-subtitle">ML Intelligence</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">Core Platform</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <LayoutDashboard className="nav-icon" size={18} />
            <span className="nav-label">Overview</span>
            <ChevronRight className="nav-arrow" size={14} />
          </NavLink>

          <NavLink
            to="/comparison"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <GitCompare className="nav-icon" size={18} />
            <span className="nav-label">Model Comparison</span>
            <ChevronRight className="nav-arrow" size={14} />
          </NavLink>

          <NavLink
            to="/details"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <FlaskConical className="nav-icon" size={18} />
            <span className="nav-label">Model Details</span>
            <ChevronRight className="nav-arrow" size={14} />
          </NavLink>

          <div className="nav-group-label">Clinical Workflow</div>

          <NavLink
            to="/prediction"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <Stethoscope className="nav-icon" size={18} />
            <span className="nav-label">Prediction</span>
            <span className="nav-tag font-mono">LAB</span>
          </NavLink>
        </nav>

        {/* System Status Footer */}
        <div className="sidebar-footer">
          <div className="system-status-box">
            <div className="status-title-row">
              <span className="status-label font-mono">SYSTEM STATUS</span>
              <ShieldCheck size={14} className="status-shield-icon" />
            </div>

            <div className={`status-pill ${isOnline ? 'status-pill--online' : 'status-pill--offline'}`}>
              <span className="status-dot" />
              <span className="status-text font-mono">
                {checking ? 'CHECKING...' : isOnline ? 'API ONLINE' : 'API OFFLINE'}
              </span>
            </div>

            <span className="status-host font-mono">http://127.0.0.1:8000</span>
          </div>

          <div className="version-info font-mono">
            v3.0.0 • ML Task 5 Evaluation
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
