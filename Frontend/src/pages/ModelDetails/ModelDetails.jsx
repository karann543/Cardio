import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FlaskConical,
  Brain,
  Sliders,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { getModels, getModelDetails } from '../../services/api';
import './ModelDetails.css';

function ModelDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modelsList, setModelsList] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available models list
  useEffect(() => {
    const loadModels = async () => {
      try {
        const available = await getModels();
        setModelsList(available);
        const queryModel = searchParams.get('model');
        if (queryModel && available.includes(queryModel)) {
          setSelectedModel(queryModel);
        } else if (available.length > 0) {
          setSelectedModel(available[0]);
        }
      } catch (err) {
        setError('Failed to fetch available models from http://127.0.0.1:8000.');
      }
    };
    loadModels();
  }, [searchParams]);

  // Fetch single model detail when selected model changes
  useEffect(() => {
    if (!selectedModel) return;

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getModelDetails(selectedModel);
        setModelData(data);
      } catch (err) {
        setError(`Failed to load model details for '${selectedModel}'.`);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [selectedModel]);

  const handleModelSelect = (name) => {
    setSelectedModel(name);
    setSearchParams({ model: name });
  };

  return (
    <div className="details-page">

      {/* ── 1. MODEL SELECTOR SEGMENTED CONTROL TABS ── */}
      <section className="selector-card">
        <div className="selector-header font-mono">
          <FlaskConical size={14} className="selector-icon" />
          <span>SELECT CLASSIFICATION MODEL LAB:</span>
        </div>

        <div className="model-tabs-segmented">
          {modelsList.map((name) => {
            const isActive = selectedModel === name;
            return (
              <button
                key={name}
                type="button"
                className={`tab-btn ${isActive ? 'tab-btn--active' : ''}`}
                onClick={() => handleModelSelect(name)}
              >
                <Brain size={14} className="tab-icon" />
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="details-loading">
          <div className="skeleton-detail-box" />
          <div className="skeleton-tuning-box" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="details-error">
          <AlertTriangle size={32} className="error-icon" />
          <h3>Error Loading Model</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Content View */}
      {!loading && modelData && (
        <div className="details-content-flow">

          {/* ── 2. MODEL OVERVIEW CARD ── */}
          <section className="detail-card">
            <div className="detail-card-top">
              <div className="model-main-titles">
                <span className="eyebrow font-mono">
                  <Activity size={12} />
                  Pipeline Specification
                </span>
                <h2 className="model-lab-title">{modelData.name}</h2>
                <p className="model-lab-sub">
                  Scikit-Learn classification pipeline integrated with StandardScaler normalization.
                </p>
              </div>

              <span
                className={`fit-badge fit-badge--${modelData.fit_status
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                <span className="fit-badge-dot" />
                {modelData.fit_status}
              </span>
            </div>

            {/* Performance Showcase Grid */}
            <div className="performance-metrics-showcase">
              <div className="showcase-box">
                <span className="sc-lbl font-mono">ACCURACY</span>
                <span className="sc-num font-mono">{(modelData.accuracy * 100).toFixed(2)}%</span>
                <span className="sc-desc">Overall correctness on test split</span>
              </div>

              <div className="showcase-box">
                <span className="sc-lbl font-mono">PRECISION</span>
                <span className="sc-num font-mono">{(modelData.precision * 100).toFixed(2)}%</span>
                <span className="sc-desc">Positive prediction precision</span>
              </div>

              <div className="showcase-box">
                <span className="sc-lbl font-mono">RECALL</span>
                <span className="sc-num font-mono">{(modelData.recall * 100).toFixed(2)}%</span>
                <span className="sc-desc">True positive sensitivity</span>
              </div>

              <div className="showcase-box">
                <span className="sc-lbl font-mono">F1 SCORE</span>
                <span className="sc-num font-mono">{(modelData.f1_score * 100).toFixed(2)}%</span>
                <span className="sc-desc">Harmonic metric balance</span>
              </div>
            </div>

            {/* Generalization & CV Stability Grid */}
            <div className="analysis-dual-grid">
              {/* Generalization Box */}
              <div className="analysis-box">
                <h4 className="analysis-title">Generalization (Train vs. Test)</h4>
                
                <div className="progress-bar-group">
                  <div className="pg-row font-mono">
                    <span>Train Score:</span>
                    <strong>{(modelData.train_score * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="pg-track">
                    <div className="pg-fill" style={{ width: `${modelData.train_score * 100}%` }} />
                  </div>

                  <div className="pg-row font-mono">
                    <span>Test Score:</span>
                    <strong>{(modelData.test_score * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="pg-track">
                    <div className="pg-fill pg-fill--teal" style={{ width: `${modelData.test_score * 100}%` }} />
                  </div>
                </div>

                <div className="gap-indicator font-mono">
                  <span>Generalization Gap:</span>
                  <strong className="gap-val">
                    {((modelData.train_score - modelData.test_score) * 100).toFixed(2)}%
                  </strong>
                </div>

                <p className="analysis-note">
                  {modelData.train_score - modelData.test_score > 0.05
                    ? '⚠️ Training accuracy exceeds test accuracy by > 5%, indicating possible overfitting.'
                    : '✅ Training and testing scores are close and balanced, demonstrating solid generalisation.'}
                </p>
              </div>

              {/* CV Stability Box */}
              <div className="analysis-box">
                <h4 className="analysis-title">5-Fold Cross-Validation Stability</h4>

                <div className="cv-details-rows font-mono">
                  <div className="cv-d-row">
                    <span className="cv-d-lbl">Average CV Score:</span>
                    <span className="cv-d-val font-bold">{(modelData.cv_mean * 100).toFixed(2)}%</span>
                  </div>
                  <div className="cv-d-row">
                    <span className="cv-d-lbl">Standard Deviation Spread:</span>
                    <span className="cv-d-val">±{(modelData.cv_std * 100).toFixed(2)}%</span>
                  </div>
                  <div className="cv-d-row">
                    <span className="cv-d-lbl">Stability Rating:</span>
                    <span className="cv-d-val text-teal font-bold">
                      {modelData.cv_std < 0.005 ? 'High Stability' : 'Moderate Stability'}
                    </span>
                  </div>
                </div>

                <p className="analysis-note">
                  Calculated from 5 Stratified K-Fold splits across the 56,000 training records.
                </p>
              </div>
            </div>
          </section>

          {/* ── 3. HYPERPARAMETER TUNING LAB ── */}
          {modelData.tuning && (
            <section className="detail-card tuning-lab-card">
              <div className="tuning-card-header">
                <div>
                  <span className="eyebrow font-mono">
                    <Sliders size={12} />
                    HYPERPARAMETER OPTIMIZATION LAB
                  </span>
                  <h3 className="tuning-lab-title">
                    GridSearchCV Optimization for {modelData.tuning.model_name}
                  </h3>
                </div>

                {modelData.tuning.improvement_percent && (
                  <div className="improvement-pill font-mono">
                    <Zap size={14} />
                    <span>GAIN: +{modelData.tuning.improvement_percent}</span>
                  </div>
                )}
              </div>

              {/* Score Shift Comparison */}
              <div className="tuning-score-comparison">
                <div className="ts-card">
                  <span className="ts-tag font-mono">BEFORE TUNING</span>
                  <span className="ts-score font-mono">
                    {(modelData.tuning.before_tuning_score * 100).toFixed(2)}%
                  </span>
                  <span className="ts-sub">Default Scikit-learn parameters</span>
                </div>

                <div className="ts-transition font-mono">→</div>

                <div className="ts-card ts-card--after">
                  <span className="ts-tag font-mono">AFTER TUNING</span>
                  <span className="ts-score font-mono text-teal">
                    {(modelData.tuning.after_tuning_score * 100).toFixed(2)}%
                  </span>
                  <span className="ts-sub">Discovered optimal hyperparameters</span>
                </div>

                <div className="ts-card ts-card--cv">
                  <span className="ts-tag font-mono">BEST CV ACCURACY</span>
                  <span className="ts-score font-mono">
                    {(modelData.tuning.best_cv_score * 100).toFixed(2)}%
                  </span>
                  <span className="ts-sub">GridSearchCV 5-fold evaluation</span>
                </div>
              </div>

              {/* Discovered Best Parameters */}
              <div className="best-params-container">
                <h4 className="params-title">Discovered Optimal Hyperparameters:</h4>
                <div className="params-grid font-mono">
                  {Object.entries(modelData.tuning.best_params).map(([param, val]) => (
                    <div key={param} className="param-card">
                      <span className="param-name">{param}</span>
                      <span className="param-value">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Action Links */}
          <div className="details-bottom-actions">
            <Link to="/prediction" className="btn btn--primary">
              <span>Test Prediction with {modelData.name}</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/comparison" className="btn btn--outline">
              <span>Back to Comparison Matrix</span>
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}

export default ModelDetails;
