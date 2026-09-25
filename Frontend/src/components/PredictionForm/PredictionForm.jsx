import { useState, useEffect } from 'react';
import {
  Brain,
  User,
  Activity,
  Heart,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getModels, getModelResults, predictDisease } from '../../services/api';
import ResultCard from '../ResultCard/ResultCard';
import './PredictionForm.css';

const INITIAL_STATE = {
  age: '',
  gender: '1',
  height: '',
  weight: '',
  ap_hi: '',
  ap_lo: '',
  cholesterol: '1',
  gluc: '1',
  smoke: '0',
  alco: '0',
  active: '1'
};

const PRESETS = {
  healthy: {
    age: '35',
    gender: '1',
    height: '168',
    weight: '62',
    ap_hi: '115',
    ap_lo: '75',
    cholesterol: '1',
    gluc: '1',
    smoke: '0',
    alco: '0',
    active: '1'
  },
  risk: {
    age: '58',
    gender: '2',
    height: '175',
    weight: '92',
    ap_hi: '155',
    ap_lo: '100',
    cholesterol: '3',
    gluc: '2',
    smoke: '1',
    alco: '1',
    active: '0'
  }
};

function validate(form) {
  const errors = {};

  if (!form.age || Number(form.age) < 1 || Number(form.age) > 120) {
    errors.age = 'Age must be between 1 and 120 years.';
  }
  if (!form.height || Number(form.height) < 50 || Number(form.height) > 250) {
    errors.height = 'Height must be between 50 and 250 cm.';
  }
  if (!form.weight || Number(form.weight) < 20 || Number(form.weight) > 300) {
    errors.weight = 'Weight must be between 20 and 300 kg.';
  }
  if (!form.ap_hi || Number(form.ap_hi) < 40 || Number(form.ap_hi) > 300) {
    errors.ap_hi = 'Systolic blood pressure must be between 40 and 300 mmHg.';
  }
  if (!form.ap_lo || Number(form.ap_lo) < 30 || Number(form.ap_lo) > 200) {
    errors.ap_lo = 'Diastolic blood pressure must be between 30 and 200 mmHg.';
  }
  if (
    form.ap_hi &&
    form.ap_lo &&
    Number(form.ap_hi) <= Number(form.ap_lo)
  ) {
    errors.ap_hi = 'Systolic pressure (ap_hi) must be strictly greater than diastolic (ap_lo).';
  }

  return errors;
}

function PredictionForm() {
  const [modelsList, setModelsList] = useState([]);
  const [modelMetricsMap, setModelMetricsMap] = useState({});
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showForm, setShowForm] = useState(true);

  // Load models dynamically from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const available = await getModels();
        if (available && available.length > 0) {
          setModelsList(available);
          setSelectedModel(available[0]);
        }
        const results = await getModelResults();
        if (results && results.models) {
          const map = {};
          results.models.forEach((m) => {
            map[m.name] = (m.cv_mean * 100).toFixed(2);
          });
          setModelMetricsMap(map);
        }
      } catch (err) {
        setModelsList(['Logistic Regression', 'Random Forest', 'AdaBoost', 'Gradient Boosting']);
      }
    };
    fetchModels();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: String(value) }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const loadPreset = (presetKey) => {
    if (PRESETS[presetKey]) {
      setForm(PRESETS[presetKey]);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valErrors = validate(form);
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setLoading(true);
    setApiError(null);
    setPredictionResult(null);

    const payload = {
      age: Number(form.age),
      gender: Number(form.gender),
      height: Number(form.height),
      weight: Number(form.weight),
      ap_hi: Number(form.ap_hi),
      ap_lo: Number(form.ap_lo),
      cholesterol: Number(form.cholesterol),
      gluc: Number(form.gluc),
      smoke: Number(form.smoke),
      alco: Number(form.alco),
      active: Number(form.active)
    };

    try {
      const data = await predictDisease(selectedModel, payload);
      setPredictionResult(data);
      setShowForm(false);
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || 'Unable to communicate with prediction API.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_STATE);
    setErrors({});
    setPredictionResult(null);
    setApiError(null);
    setShowForm(true);
  };

  if (!showForm && predictionResult) {
    return (
      <ResultCard
        result={predictionResult}
        onPredictAgain={() => setShowForm(true)}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="prediction-form-card">

      {/* ── DEMO PRESETS BAR ── */}
      <div className="preset-bar">
        <span className="preset-label font-mono">DEMONSTRATION PRESETS:</span>
        <button
          type="button"
          className="preset-btn preset-btn--healthy font-mono"
          onClick={() => loadPreset('healthy')}
        >
          <CheckCircle2 size={14} />
          <span>Low Risk Profile</span>
        </button>
        <button
          type="button"
          className="preset-btn preset-btn--risk font-mono"
          onClick={() => loadPreset('risk')}
        >
          <AlertTriangle size={14} />
          <span>High Risk Profile</span>
        </button>
      </div>

      <form className="prediction-form" onSubmit={handleSubmit} noValidate>

        {/* ── 1. MODEL SELECTION CARDS ── */}
        <section className="form-section">
          <div className="form-section-title-row">
            <span className="section-step-num font-mono">01</span>
            <div>
              <h3 className="form-section-heading">Select Model Evaluator</h3>
              <p className="form-section-sub">Choose which trained pipeline will infer risk</p>
            </div>
          </div>

          <div className="model-selection-grid">
            {modelsList.map((mName) => {
              const isSelected = selectedModel === mName;
              const cvMean = modelMetricsMap[mName];
              return (
                <div
                  key={mName}
                  className={`model-option-card ${isSelected ? 'model-option-card--selected' : ''}`}
                  onClick={() => setSelectedModel(mName)}
                >
                  <div className="m-card-top">
                    <Brain size={18} className="m-card-icon" />
                    <input
                      type="radio"
                      name="model-choice"
                      checked={isSelected}
                      onChange={() => setSelectedModel(mName)}
                      className="m-card-radio"
                    />
                  </div>
                  <span className="m-card-title">{mName}</span>
                  <span className="m-card-cv font-mono">
                    {cvMean ? `CV Score: ${cvMean}%` : 'Scikit-learn'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 2. DEMOGRAPHICS ── */}
        <section className="form-section">
          <div className="form-section-title-row">
            <span className="section-step-num font-mono">02</span>
            <div>
              <h3 className="form-section-heading">Patient Demographics</h3>
              <p className="form-section-sub">Biological characteristics</p>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Age */}
            <div className="field-group">
              <label className="field-label" htmlFor="age">
                Age (years) <span className="req">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 52"
                  className={`input-control ${errors.age ? 'input-control--error' : ''}`}
                  value={form.age}
                  onChange={handleChange}
                />
                <span className="unit-label font-mono">YRS</span>
              </div>
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>

            {/* Gender */}
            <div className="field-group">
              <label className="field-label">
                Biological Sex <span className="req">*</span>
              </label>
              <div className="segmented-toggle">
                <button
                  type="button"
                  className={`toggle-option ${form.gender === '1' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('gender', '1')}
                >
                  Female (1)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.gender === '2' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('gender', '2')}
                >
                  Male (2)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. BODY MEASUREMENTS ── */}
        <section className="form-section">
          <div className="form-section-title-row">
            <span className="section-step-num font-mono">03</span>
            <div>
              <h3 className="form-section-heading">Body Measurements</h3>
              <p className="form-section-sub">Physical dimensions</p>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Height */}
            <div className="field-group">
              <label className="field-label" htmlFor="height">
                Height (cm) <span className="req">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="height"
                  name="height"
                  type="number"
                  min="50"
                  max="250"
                  placeholder="e.g. 165"
                  className={`input-control ${errors.height ? 'input-control--error' : ''}`}
                  value={form.height}
                  onChange={handleChange}
                />
                <span className="unit-label font-mono">CM</span>
              </div>
              {errors.height && <span className="field-error">{errors.height}</span>}
            </div>

            {/* Weight */}
            <div className="field-group">
              <label className="field-label" htmlFor="weight">
                Weight (kg) <span className="req">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  min="20"
                  max="300"
                  placeholder="e.g. 70"
                  className={`input-control ${errors.weight ? 'input-control--error' : ''}`}
                  value={form.weight}
                  onChange={handleChange}
                />
                <span className="unit-label font-mono">KG</span>
              </div>
              {errors.weight && <span className="field-error">{errors.weight}</span>}
            </div>
          </div>
        </section>

        {/* ── 4. CLINICAL READINGS ── */}
        <section className="form-section">
          <div className="form-section-title-row">
            <span className="section-step-num font-mono">04</span>
            <div>
              <h3 className="form-section-heading">Clinical & Blood Pressure Readings</h3>
              <p className="form-section-sub">Exam diagnostic markers</p>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Systolic BP */}
            <div className="field-group">
              <label className="field-label" htmlFor="ap_hi">
                Systolic BP (ap_hi) <span className="req">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="ap_hi"
                  name="ap_hi"
                  type="number"
                  min="40"
                  max="300"
                  placeholder="e.g. 120"
                  className={`input-control ${errors.ap_hi ? 'input-control--error' : ''}`}
                  value={form.ap_hi}
                  onChange={handleChange}
                />
                <span className="unit-label font-mono">mmHg</span>
              </div>
              {errors.ap_hi && <span className="field-error">{errors.ap_hi}</span>}
            </div>

            {/* Diastolic BP */}
            <div className="field-group">
              <label className="field-label" htmlFor="ap_lo">
                Diastolic BP (ap_lo) <span className="req">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="ap_lo"
                  name="ap_lo"
                  type="number"
                  min="30"
                  max="200"
                  placeholder="e.g. 80"
                  className={`input-control ${errors.ap_lo ? 'input-control--error' : ''}`}
                  value={form.ap_lo}
                  onChange={handleChange}
                />
                <span className="unit-label font-mono">mmHg</span>
              </div>
              {errors.ap_lo && <span className="field-error">{errors.ap_lo}</span>}
            </div>

            {/* Cholesterol */}
            <div className="field-group field-group--full">
              <label className="field-label">
                Cholesterol Level <span className="req">*</span>
              </label>
              <div className="segmented-toggle segmented-toggle--3col">
                <button
                  type="button"
                  className={`toggle-option ${form.cholesterol === '1' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('cholesterol', '1')}
                >
                  1 – Normal
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.cholesterol === '2' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('cholesterol', '2')}
                >
                  2 – Above Normal
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.cholesterol === '3' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('cholesterol', '3')}
                >
                  3 – Well Above Normal
                </button>
              </div>
            </div>

            {/* Glucose */}
            <div className="field-group field-group--full">
              <label className="field-label">
                Glucose Level <span className="req">*</span>
              </label>
              <div className="segmented-toggle segmented-toggle--3col">
                <button
                  type="button"
                  className={`toggle-option ${form.gluc === '1' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('gluc', '1')}
                >
                  1 – Normal
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.gluc === '2' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('gluc', '2')}
                >
                  2 – Above Normal
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.gluc === '3' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('gluc', '3')}
                >
                  3 – Well Above Normal
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. LIFESTYLE FACTORS ── */}
        <section className="form-section">
          <div className="form-section-title-row">
            <span className="section-step-num font-mono">05</span>
            <div>
              <h3 className="form-section-heading">Lifestyle & Behavioral Factors</h3>
              <p className="form-section-sub">Personal habits</p>
            </div>
          </div>

          <div className="form-fields-grid form-fields-grid--3col">
            {/* Smoking */}
            <div className="field-group">
              <label className="field-label">Smoking Tobacco</label>
              <div className="segmented-toggle">
                <button
                  type="button"
                  className={`toggle-option ${form.smoke === '0' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('smoke', '0')}
                >
                  No (0)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.smoke === '1' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('smoke', '1')}
                >
                  Yes (1)
                </button>
              </div>
            </div>

            {/* Alcohol */}
            <div className="field-group">
              <label className="field-label">Alcohol Intake</label>
              <div className="segmented-toggle">
                <button
                  type="button"
                  className={`toggle-option ${form.alco === '0' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('alco', '0')}
                >
                  No (0)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.alco === '1' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('alco', '1')}
                >
                  Yes (1)
                </button>
              </div>
            </div>

            {/* Activity */}
            <div className="field-group">
              <label className="field-label">Physical Activity</label>
              <div className="segmented-toggle">
                <button
                  type="button"
                  className={`toggle-option ${form.active === '0' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('active', '0')}
                >
                  No (0)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${form.active === '1' ? 'toggle-option--active' : ''}`}
                  onClick={() => handleSelectField('active', '1')}
                >
                  Yes (1)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* API Error Notification */}
        {apiError && (
          <div className="form-api-error font-mono">
            <AlertTriangle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Submit & Reset Actions */}
        <div className="form-actions-bar">
          <button
            type="submit"
            className="btn btn--primary btn--large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                <span>ANALYZING CLINICAL PROFILE...</span>
              </>
            ) : (
              <>
                <span>RUN PREDICTION WITH {selectedModel.toUpperCase()}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={16} />
            <span>Reset Form</span>
          </button>
        </div>

      </form>
    </div>
  );
}

export default PredictionForm;
