import { Link } from 'react-router-dom';
import InfoCard from '../../components/InfoCard/InfoCard';
import './Home.css';

/* ─── Feature card data ─── */
const features = [
  {
    id: 'ml',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Machine Learning',
    description: 'Powered by Logistic Regression with StandardScaler preprocessing for accurate cardiovascular disease risk estimation.',
  },
  {
    id: 'easy',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Easy to Use',
    description: 'Enter basic patient information across simple, clearly labelled sections. No medical expertise required to operate the form.',
  },
  {
    id: 'instant',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Instant Result',
    description: 'Get the prediction immediately after submission. Results are clearly displayed as positive or negative with a full disclaimer.',
  },
];

/* ─── How It Works steps ─── */
const steps = [
  { number: '1', label: 'Enter Patient Information' },
  { number: '2', label: 'Submit the Form' },
  { number: '3', label: 'ML Model Processes Data' },
  { number: '4', label: 'View Your Prediction' },
];

function Home() {
  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero" aria-label="Introduction">
        <div className="container hero__inner">
          <div className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            Logistic Regression · scikit-learn
          </div>

          <h1 className="hero__heading">
            Cardiovascular Disease<br />
            <span className="hero__heading-accent">Prediction</span>
          </h1>

          <p className="hero__subtitle">
            Use machine learning to estimate cardiovascular disease risk
            based on basic patient health information.
          </p>

          <div className="hero__actions">
            <Link to="/prediction" className="hero__btn hero__btn--primary">
              Start Prediction
            </Link>
            <a href="#how-it-works" className="hero__btn hero__btn--secondary">
              Learn More
            </a>
          </div>

          {/* Trust indicators */}
          <div className="hero__trust">
            <div className="hero__trust-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              11 clinical features
            </div>
            <div className="hero__trust-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              No data stored
            </div>
            <div className="hero__trust-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Instant results
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="features" aria-label="Features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why CardioPredict?</h2>
            <p className="section-subtitle">
              A straightforward machine learning tool built for simplicity and clarity.
            </p>
          </div>
          <div className="features__grid">
            {features.map((f) => (
              <InfoCard key={f.id} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works" id="how-it-works" aria-label="How it works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Four simple steps from patient information to prediction result.
            </p>
          </div>

          <div className="steps">
            {steps.map((step, i) => (
              <div className="step" key={step.number}>
                <div className="step__circle" aria-hidden="true">{step.number}</div>
                <p className="step__label">{step.label}</p>
                {i < steps.length - 1 && (
                  <div className="step__arrow" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="how-it-works__cta">
            <Link to="/prediction" className="hero__btn hero__btn--primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
