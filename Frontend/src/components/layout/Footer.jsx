import { AlertCircle } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand font-mono">
          <strong>CardioLens</strong> • Cardiovascular ML Intelligence Platform
        </div>

        <div className="footer-disclaimer">
          <AlertCircle size={14} className="disclaimer-icon" />
          <span>Educational demonstration only. This platform does not provide medical diagnoses.</span>
        </div>

        <div className="footer-stack font-mono">
          Task 5 ML • FastAPI • React • Scikit-Learn
        </div>
      </div>
    </footer>
  );
}

export default Footer;
