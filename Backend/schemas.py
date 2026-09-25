from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class PatientFeatures(BaseModel):
    age: float = Field(..., description="Age in years (e.g., 50.0)", ge=1, le=120)
    gender: int = Field(..., description="1 = Female, 2 = Male", ge=1, le=2)
    height: float = Field(..., description="Height in cm (e.g., 165.0)", ge=50, le=250)
    weight: float = Field(..., description="Weight in kg (e.g., 70.0)", ge=20, le=300)
    ap_hi: float = Field(..., description="Systolic blood pressure (e.g., 120.0)", ge=40, le=300)
    ap_lo: float = Field(..., description="Diastolic blood pressure (e.g., 80.0)", ge=30, le=200)
    cholesterol: int = Field(..., description="1 = Normal, 2 = Above Normal, 3 = Well Above Normal", ge=1, le=3)
    gluc: int = Field(..., description="1 = Normal, 2 = Above Normal, 3 = Well Above Normal", ge=1, le=3)
    smoke: int = Field(..., description="1 = Smoker, 0 = Non-smoker", ge=0, le=1)
    alco: int = Field(..., description="1 = Alcohol intake, 0 = No alcohol", ge=0, le=1)
    active: int = Field(..., description="1 = Physically active, 0 = Not active", ge=0, le=1)


class PredictionRequest(BaseModel):
    model: Optional[str] = Field("Random Forest", description="Name of the classification model to use")
    features: Optional[PatientFeatures] = Field(None, description="Patient clinical features")
    
    # Flat fields for backward-compatibility with older requests
    age: Optional[float] = None
    gender: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    ap_hi: Optional[float] = None
    ap_lo: Optional[float] = None
    cholesterol: Optional[int] = None
    gluc: Optional[int] = None
    smoke: Optional[int] = None
    alco: Optional[int] = None
    active: Optional[int] = None

    def get_features_dict(self) -> Dict[str, Any]:
        """Resolves features whether supplied inside 'features' object or at the root level."""
        if self.features is not None:
            return self.features.model_dump()
        
        # Check flat fields
        flat_keys = ["age", "gender", "height", "weight", "ap_hi", "ap_lo", "cholesterol", "gluc", "smoke", "alco", "active"]
        missing = [k for k in flat_keys if getattr(self, k) is None]
        if missing:
            raise ValueError(f"Missing required feature(s): {', '.join(missing)}")
        return {k: getattr(self, k) for k in flat_keys}


class PredictionResponse(BaseModel):
    model: str
    prediction: str
    prediction_code: int
    probability: Optional[float] = None
    confidence: Optional[float] = None
    message: str


class ModelMetric(BaseModel):
    name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    train_score: float
    test_score: float
    cv_mean: float
    cv_std: float
    fit_status: str


class TuningResult(BaseModel):
    model_name: str
    best_params: Dict[str, Any]
    before_tuning_score: float
    after_tuning_score: float
    improvement: float
    improvement_percent: str
    best_cv_score: float
    tuned_precision: float
    tuned_recall: float
    tuned_f1: float


class ModelResultsResponse(BaseModel):
    models: List[ModelMetric]
    best_model: str
    cv_folds: int
    tuning: Optional[Dict[str, Any]] = None
