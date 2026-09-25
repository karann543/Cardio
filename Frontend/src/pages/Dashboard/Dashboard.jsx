import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Layers,
  Database,
  Cpu,
  ArrowRight,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { getModelResults } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getModelResults();
      setData(res);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to connect to the ML backend at http://127.0.0.1:8000. Ensure the FastAPI server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Skeleton UI loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton-hero" />
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
        <div className="skeleton-models">
          <div className="skeleton-model-card" />
          <div className="skeleton-model-card" />
          <div className="skeleton-model-card" />
          <div className="skeleton-model-card" />
        </div>
      </div>
    );
  }

  // Offline / Error State
  if (error) {
    return (
      <div className="dashboard-error-container">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <AlertTriangle size={32} className="error-icon" />
          </div>
          <h2 className="error-title">Backend Connection Error</h2>
          <p className="error-desc">{error}</p>
          <div className="error-instructions font-mono">
            <span>Run Backend Command:</span>
            <code>uvicorn main:app --reload --port 8000</code>
          </div>
          <button onClick={fetchData} className="btn btn--primary">
            <RefreshCw size={16} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const { models = [], best_model, cv_folds = 5, tuning } = data || {};

  // Build dynamic signal graph data from real model metrics
  const signalData = models.map((m, idx) => ({
    name: m.name.split(' ')[0],
    fullName: m.name,
    cvScore: Number((m.cv_mean * 100).toFixed(2)),
    accuracy: Number((m.accuracy * 100).toFixed(2)),
    f1: Number((m.f1_score * 100).toFixed(2))
  }));

  return (
    <div className="dashboard-page">
      {/* ── 1. HERO SECTION ── */}
      <section className="hero-card">
        <div className="hero-content">
          <span className="eyebrow">
            <Sparkles size={13} />
            Cardiovascular ML Intelligence
          </span>
          <h2 className="hero-headline">
            Four models. One clinical dataset.<br />Transparent evaluation.
          </h2>
          <p className="hero-subtext">
            Explore how different classification algorithms interpret 70,000 cardiovascular patient records.
            Evaluated in-memory with 5-fold cross-validation and hyperparameter tuning.
          </p>

          <div className="hero-actions">
            <Link to="/prediction" className="btn btn--primary">
              <span>Run a Prediction</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/comparison" className="btn btn--outline">
              <span>Compare Models</span>
            </Link>
          </div>
        </div>

        {/* Hero Dynamic Signal Visualizer */}
        <div className="hero-visualizer">
          <div className="visualizer-card">
            <div className="visualizer-header">
              <span className="visualizer-title font-mono">MODEL SIGNAL • CV ACCURACY</span>
              <Activity size={14} className="visualizer-pulse" />
            </div>

            <div className="visualizer-metric">
              <span className="metric-big font-mono">
                {models.length > 0
                  ? `${(models.reduce((acc, m) => acc + m.cv_mean, 0) / models.length * 100).toFixed(2)}%`
                  : '73.20%'}
              </span>
              <span className="metric-lbl font-mono">MEAN CV ACCURACY</span>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={signalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip font-mono">
                            <span className="tt-name">{payload[0].payload.fullName}</span>
                            <span className="tt-val">CV: {payload[0].value}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cvScore"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. METRICS SNAPSHOT ── */}
      <section className="metrics-section">
        <div className="metric-box">
          <div className="metric-box-icon">
            <Brain size={18} />
          </div>
          <div className="metric-box-info">
            <span className="metric-box-label font-mono">MODELS EVALUATED</span>
            <span className="metric-box-value font-mono">0{models.length}</span>
            <span className="metric-box-sub">Classification algorithms</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-icon">
            <Layers size={18} />
          </div>
          <div className="metric-box-info">
            <span className="metric-box-label font-mono">CROSS VALIDATION</span>
            <span className="metric-box-value font-mono">0{cv_folds} Folds</span>
            <span className="metric-box-sub">Stratified split evaluation</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-icon">
            <Database size={18} />
          </div>
          <div className="metric-box-info">
            <span className="metric-box-label font-mono">CLINICAL DATASET</span>
            <span className="metric-box-value font-mono">70,000</span>
            <span className="metric-box-sub">Patient health records</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-icon">
            <Cpu size={18} />
          </div>
          <div className="metric-box-info">
            <span className="metric-box-label font-mono">MODELS IN MEMORY</span>
            <span className="metric-box-value font-mono">0{models.length}</span>
            <span className="metric-box-sub">Scikit-learn pipelines</span>
          </div>
        </div>
      </section>

      {/* ── 3. MODEL SNAPSHOT GRID ── */}
      <section className="section-block">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Model Performance Snapshot</h3>
            <p className="section-subtitle">Real-time metrics fetched from FastAPI pipeline evaluation</p>
          </div>
          <Link to="/comparison" className="btn btn--ghost">
            <span>View Comparison Table</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="models-snapshot-grid">
          {models.map((m) => {
            const isSelectedForTuning = m.name === best_model;
            const fitClass = m.fit_status.toLowerCase().replace(/\s+/g, '-');
            return (
              <div
                key={m.name}
                className={`snapshot-card ${isSelectedForTuning ? 'snapshot-card--selected' : ''}`}
              >
                {isSelectedForTuning && (
                  <div className="selected-tag font-mono">
                    <CheckCircle2 size={12} />
                    SELECTED BASED ON CV
                  </div>
                )}

                <div className="snapshot-card-header">
                  <h4 className="model-card-title">{m.name}</h4>
                  <span className={`fit-badge fit-badge--${fitClass}`}>
                    <span className="fit-badge-dot" />
                    {m.fit_status}
                  </span>
                </div>

                <div className="snapshot-metrics-grid">
                  <div className="sm-box">
                    <span className="sm-label font-mono">ACCURACY</span>
                    <span className="sm-value font-mono">{(m.accuracy * 100).toFixed(2)}%</span>
                  </div>
                  <div className="sm-box">
                    <span className="sm-label font-mono">F1 SCORE</span>
                    <span className="sm-value font-mono">{(m.f1_score * 100).toFixed(2)}%</span>
                  </div>
                  <div className="sm-box">
                    <span className="sm-label font-mono">CV MEAN</span>
                    <span className="sm-value font-mono">{(m.cv_mean * 100).toFixed(2)}%</span>
                  </div>
                  <div className="sm-box">
                    <span className="sm-label font-mono">CV SPREAD</span>
                    <span className="sm-value font-mono">±{(m.cv_std * 100).toFixed(2)}%</span>
                  </div>
                </div>

                <div className="snapshot-card-footer">
                  <Link
                    to={`/details?model=${encodeURIComponent(m.name)}`}
                    className="details-link font-mono"
                  >
                    <span>View details</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. MODEL SELECTED FOR TUNING BANNER ── */}
      {best_model && (
        <section className="tuning-highlight-card">
          <div className="tuning-highlight-content">
            <div className="tuning-tag font-mono">
              <TrendingUp size={14} />
              MODEL SELECTED FOR TUNING BASED ON 5-FOLD CV
            </div>
            <h3 className="tuning-model-name">{best_model}</h3>
            <p className="tuning-desc">
              Selected automatically as the top-performing candidate during 5-fold cross-validation.
              {tuning && tuning.improvement_percent && (
                <> Hyperparameter optimization improved test accuracy by <strong className="font-mono text-teal">+{tuning.improvement_percent}</strong>.</>
              )}
            </p>
          </div>

          <div className="tuning-action-box">
            {tuning && (
              <div className="tuning-scores-display font-mono">
                <div className="ts-item">
                  <span className="ts-lbl">BEFORE TUNING</span>
                  <span className="ts-val">{(tuning.before_tuning_score * 100).toFixed(2)}%</span>
                </div>
                <div className="ts-arrow">→</div>
                <div className="ts-item ts-item--after">
                  <span className="ts-lbl">AFTER TUNING</span>
                  <span className="ts-val">{(tuning.after_tuning_score * 100).toFixed(2)}%</span>
                </div>
              </div>
            )}
            <Link to={`/details?model=${encodeURIComponent(best_model)}`} className="btn btn--primary">
              <span>Inspect Hyperparameters</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
