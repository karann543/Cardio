import { Stethoscope, AlertCircle } from 'lucide-react';
import PredictionForm from '../../components/PredictionForm/PredictionForm';
import './Prediction.css';

function Prediction() {
  return (
    <div className="prediction-page font-sans">
      {/* Medical Disclaimer Banner */}
      <div className="disclaimer-banner" role="note">
        <AlertCircle size={16} className="disclaimer-banner-icon" />
        <p>
          <strong>Clinical Educational Tool:</strong> This prediction interface is designed for machine learning evaluation only.
          It does not constitute a clinical diagnosis or medical advice.
        </p>
      </div>

      {/* Main Prediction Form */}
      <PredictionForm />
    </div>
  );
}

export default Prediction;
