import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { getModelResults } from '../../services/api';
import './Comparison.css';

function Comparison() {
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
        'Failed to fetch model comparison data from http://127.0.0.1:8000. Ensure FastAPI backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="comparison-loading">
        <div className="skeleton-table" />
        <div className="skeleton-chart" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-error">
        <AlertTriangle size={32} className="error-icon" />
        <h2>Backend Connection Error</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="btn btn--primary">
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { models = [], best_model, cv_folds = 5 } = data || {};

  // Recharts grouped bar chart data formatted from API
  const chartData = models.map((m) => ({
    name: m.name.replace('Regression', 'Reg.').replace('Boosting', 'Boost'),
    fullName: m.name,
    Accuracy: Number((m.accuracy * 100).toFixed(2)),
    Precision: Number((m.precision * 100).toFixed(2)),
    Recall: Number((m.recall * 100).toFixed(2)),
    F1: Number((m.f1_score * 100).toFixed(2))
  }));

  // Recharts CV stability horizontal chart data
  const cvStabilityData = models.map((m) => ({
    name: m.name,
    cvMean: Number((m.cv_mean * 100).toFixed(2)),
    cvStd: Number((m.cv_std * 100).toFixed(2))
  }));

  return (
    <div className="comparison-page">

      {/* ── 1. COMPARISON MATRIX TABLE ── */}
      <section className="table-card">
        <div className="table-card-header">
          <div className="table-header-titles">
            <span className="eyebrow">
              <GitCompare size={12} />
              Evaluation Matrix
            </span>
            <h2 className="table-main-title">Classification Performance Matrix</h2>
            <p className="table-sub-title">
              Evaluated across 70,000 records. Highlighted model is selected based on highest {cv_folds}-Fold CV Mean.
            </p>
          </div>

          {best_model && (
            <div className="selected-model-pill font-mono">
              <CheckCircle2 size={14} className="pill-check-icon" />
              <span>SELECTED BASED ON CV:</span>
              <strong>{best_model}</strong>
            </div>
          )}
        </div>

        <div className="table-scroll-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th className="th-left">MODEL</th>
                <th>ACCURACY</th>
                <th>PRECISION</th>
                <th>RECALL</th>
                <th>F1 SCORE</th>
                <th>TRAIN</th>
                <th>TEST</th>
                <th>CV MEAN</th>
                <th>CV STD</th>
                <th>FIT STATUS</th>
                <th className="th-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => {
                const isSelected = m.name === best_model;
                const fitClass = m.fit_status.toLowerCase().replace(/\s+/g, '-');
                return (
                  <tr key={m.name} className={isSelected ? 'tr-selected' : ''}>
                    <td className="td-model-name">
                      <div className="model-cell-group">
                        <span className="model-name-text">{m.name}</span>
                        {isSelected && (
                          <span className="selected-chip font-mono">TOP CV</span>
                        )}
                      </div>
                    </td>
                    <td className="font-mono font-bold">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="font-mono">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="font-mono">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="font-mono font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                    <td className="font-mono text-muted-val">{(m.train_score * 100).toFixed(2)}%</td>
                    <td className="font-mono text-muted-val">{(m.test_score * 100).toFixed(2)}%</td>
                    <td className="font-mono font-bold td-cv-mean">
                      {(m.cv_mean * 100).toFixed(2)}%
                    </td>
                    <td className="font-mono td-cv-std">
                      ±{(m.cv_std * 100).toFixed(2)}%
                    </td>
                    <td>
                      <span className={`fit-badge fit-badge--${fitClass}`}>
                        <span className="fit-badge-dot" />
                        {m.fit_status}
                      </span>
                    </td>
                    <td className="td-action">
                      <Link
                        to={`/details?model=${encodeURIComponent(m.name)}`}
                        className="btn-table-action font-mono"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 2. METRIC VISUALIZATIONS ── */}
      <div className="charts-grid">
        {/* Performance Metrics Grouped Bar Chart */}
        <section className="chart-card">
          <div className="chart-card-header">
            <span className="eyebrow">
              <BarChart3 size={12} />
              Performance Comparison
            </span>
            <h3 className="chart-card-title">Model Metrics Comparison</h3>
            <p className="chart-card-sub">Accuracy, Precision, Recall & F1-Score side-by-side</p>
          </div>

          <div className="rechart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,23,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <YAxis domain={[60, 80]} tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--text-main)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Accuracy" fill="#0F766E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precision" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Cross Validation Stability Chart */}
        <section className="chart-card">
          <div className="chart-card-header">
            <span className="eyebrow">
              <TrendingUp size={12} />
              Stability Analysis
            </span>
            <h3 className="chart-card-title">5-Fold Cross-Validation Stability</h3>
            <p className="chart-card-sub">Higher CV Mean with lower CV Standard Deviation (spread) indicates stability</p>
          </div>

          <div className="cv-stability-bars font-mono">
            {cvStabilityData.map((m) => {
              const maxMean = Math.max(...cvStabilityData.map(d => d.cvMean));
              const isBest = m.cvMean === maxMean;
              return (
                <div key={m.name} className="cv-bar-row">
                  <div className="cv-bar-label">
                    <span className="cv-model-title">{m.name}</span>
                    <span className="cv-score font-bold">{m.cvMean}%</span>
                  </div>

                  <div className="cv-track-container">
                    <div
                      className={`cv-track-fill ${isBest ? 'cv-track-fill--best' : ''}`}
                      style={{ width: `${((m.cvMean - 65) / (80 - 65)) * 100}%` }}
                    />
                  </div>

                  <div className="cv-std-pill">
                    Spread: ±{m.cvStd}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── 3. TASK 5 CRITERIA GUIDANCE CARDS ── */}
      <section className="criteria-grid">
        <div className="criteria-card">
          <div className="criteria-card-header">
            <ShieldCheck size={20} className="criteria-icon" />
            <h4 className="criteria-title">Overfitting & Underfitting Rules</h4>
          </div>
          <ul className="criteria-list">
            <li>
              <strong>Good Fit:</strong> Training and test accuracy scores are close and balanced (&lt; 5% gap), demonstrating high generalization capacity on unseen clinical profiles.
            </li>
            <li>
              <strong>Overfitting:</strong> Training accuracy is significantly higher than test accuracy (&gt; 5% gap), indicating the pipeline memorized training noise.
            </li>
            <li>
              <strong>Underfitting:</strong> Both training and testing scores remain low (&lt; 65%), showing insufficient algorithm capacity.
            </li>
          </ul>
        </div>

        <div className="criteria-card">
          <div className="criteria-card-header">
            <Info size={20} className="criteria-icon" />
            <h4 className="criteria-title">5-Fold Cross-Validation Stability</h4>
          </div>
          <ul className="criteria-list">
            <li>
              <strong>CV Mean Score:</strong> Average validation accuracy calculated across 5 independent Stratified K-Fold splits of the 56,000 training records.
            </li>
            <li>
              <strong>CV Standard Deviation:</strong> Measures variation across folds. Lower spread (e.g. ±0.20%) indicates superior model stability.
            </li>
            <li>
              <strong>Model Selection:</strong> The pipeline achieving the highest CV Mean is selected for hyperparameter tuning.
            </li>
          </ul>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="comparison-bottom-actions">
        <Link to="/prediction" className="btn btn--primary">
          <span>Proceed to Clinical Prediction</span>
          <ArrowRight size={16} />
        </Link>
        <Link to="/" className="btn btn--outline">
          <span>Back to Dashboard</span>
        </Link>
      </div>

    </div>
  );
}

export default Comparison;
