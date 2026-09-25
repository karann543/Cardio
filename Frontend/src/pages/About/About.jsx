import { Link } from 'react-router-dom';
import './About.css';

const features = [
  'Age',
  'Gender',
  'Height',
  'Weight',
  'Systolic Blood Pressure',
  'Diastolic Blood Pressure',
  'Cholesterol',
  'Glucose',
  'Smoking',
  'Alcohol Consumption',
  'Physical Activity',
];

const modelDetails = [
  { label: 'Algorithm', value: 'Logistic Regression' },
  { label: 'Preprocessing', value: 'StandardScaler' },
  { label: 'Dataset', value: 'Cardiovascular Disease Dataset' },
  { label: 'Target Variable', value: 'cardio (0 = No CVD, 1 = CVD)' },
  { label: 'Framework', value: 'scikit-learn (Python)' },
];

function About() {
  return (
    <div className="about-page">
      <div className="container">

        {/* Page header */}
        <div className="about-page__header">
          <div className="about-breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">›</span>
            <span>About</span>
          </div>
          <h1 className="about-page__title">About CardioPredict</h1>
          <p className="about-page__subtitle">
            A machine learning-based cardiovascular disease prediction project built for educational purposes.
          </p>
        </div>

        <div className="about-grid">

          {/* ── About the Project ── */}
          <section className="about-card" aria-labelledby="about-project">
            <div className="about-card__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="about-card__title" id="about-project">About the Project</h2>
            <p className="about-card__text">
              <strong>CardioPredict</strong> is a machine learning–based cardiovascular disease prediction application
              built as a college ML project. It uses a trained Logistic Regression model to estimate the likelihood
              of cardiovascular disease based on a patient's health parameters.
            </p>
            <p className="about-card__text">
              The application is intended purely for <strong>educational and informational purposes</strong>.
              It demonstrates the end-to-end pipeline of a machine learning project — from data preprocessing
              and model training to API integration and frontend presentation.
            </p>
            <div className="about-card__warning" role="note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 9v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              This model is <strong>not clinically validated</strong>. Do not use predictions as medical advice.
            </div>
          </section>

          {/* ── ML Model ── */}
          <section className="about-card" aria-labelledby="about-model">
            <div className="about-card__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="about-card__title" id="about-model">Machine Learning Model</h2>
            <div className="model-table" role="table" aria-label="Model details">
              <div role="rowgroup">
                {modelDetails.map((row) => (
                  <div className="model-table__row" role="row" key={row.label}>
                    <div className="model-table__label" role="cell">{row.label}</div>
                    <div className="model-table__value" role="cell">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="about-card__text" style={{ marginTop: '20px' }}>
              The model pipeline applies <code>StandardScaler</code> to normalise all input features before
              passing them to the Logistic Regression classifier. Age is provided in years and handled
              consistently with the training dataset.
            </p>
          </section>

          {/* ── Features ── */}
          <section className="about-card" aria-labelledby="about-features">
            <div className="about-card__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="about-card__title" id="about-features">Features Used</h2>
            <p className="about-card__text">
              The model uses the following 11 patient features for prediction:
            </p>
            <ul className="features-list" aria-label="Model input features">
              {features.map((f) => (
                <li className="features-list__item" key={f}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* ── Prediction Flow ── */}
          <section className="about-card" aria-labelledby="about-flow">
            <div className="about-card__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="about-card__title" id="about-flow">Prediction Pipeline</h2>
            <div className="pipeline">
              {[
                'Patient Input',
                'Feature Preparation',
                'StandardScaler',
                'Logistic Regression',
                'Prediction (0 or 1)',
              ].map((step, i, arr) => (
                <div className="pipeline__item" key={step}>
                  <div className="pipeline__step">{step}</div>
                  {i < arr.length - 1 && (
                    <div className="pipeline__arrow" aria-hidden="true">↓</div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* CTA */}
        <div className="about-cta">
          <Link to="/prediction" className="about-cta__btn">
            Try the Prediction
          </Link>
        </div>

      </div>
    </div>
  );
}

export default About;
