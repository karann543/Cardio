import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, ShieldCheck } from 'lucide-react';
import { checkHealthStatus } from '../../services/api';
import './Header.css';

const ROUTE_META = {
  '/': {
    eyebrow: 'Machine Learning Intelligence',
    title: 'Cardiovascular Analytics Overview',
    subtitle: 'Transparent evaluation of 4 classification algorithms trained and cross-validated in-memory.'
  },
  '/comparison': {
    eyebrow: 'Performance Matrix',
    title: 'Model Evaluation & Comparison',
    subtitle: 'Side-by-side view of accuracy, precision, recall, F1-score, and 5-fold cross-validation stability.'
  },
  '/details': {
    eyebrow: 'Model Laboratory',
    title: 'Algorithm Deep-Dive & Hyperparameter Tuning',
    subtitle: 'Inspect individual pipeline metrics, generalization gap analysis, and GridSearchCV optimal parameters.'
  },
  '/prediction': {
    eyebrow: 'Clinical Inference',
    title: 'Patient Cardiovascular Risk Prediction',
    subtitle: 'Input 11 clinical features to evaluate cardiovascular risk with trained ML models.'
  }
};

function Header() {
  const location = useLocation();
  const meta = ROUTE_META[location.pathname] || ROUTE_META['/'];
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      try {
        const res = await checkHealthStatus();
        if (isMounted) setIsOnline(res && res.status === 'healthy');
      } catch (err) {
        if (isMounted) setIsOnline(false);
      }
    };
    verify();
  }, [location]);

  return (
    <header className="page-header">
      <div className="header-titles">
        <span className="eyebrow">
          <Activity size={12} />
          {meta.eyebrow}
        </span>
        <h1 className="header-title">{meta.title}</h1>
        <p className="header-subtitle">{meta.subtitle}</p>
      </div>

      <div className="header-status-badge">
        <div className={`status-pill ${isOnline ? 'status-pill--online' : 'status-pill--offline'}`}>
          <span className="status-dot" />
          <span className="font-mono">{isOnline ? 'API ONLINE' : 'API OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
