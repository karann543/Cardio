from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import model

from schemas import (
    PredictionRequest,
    PredictionResponse,
    ModelResultsResponse
)

from model import (
    init_ml_models,
    get_available_models,
    get_model_results,
    get_model_details,
    predict_disease
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan event handler.
    Loads pre-trained ML models from the saved artifact.
    If no artifact exists, the models are trained once and saved.
    """
    print("[API] Starting up Cardiovascular Disease API...")

    init_ml_models()

    print("[API] Models trained and ready in memory.")

    yield

    print("[API] Shutting down.")


app = FastAPI(
    title="Cardiovascular Disease Prediction API - Task 5",
    description=(
        "Machine Learning classification backend with 5-fold cross validation, "
        "model evaluation, and hyperparameter tuning."
    ),
    version="3.0.0",
    lifespan=lifespan
)


# Allow React frontend (Vite default development server on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cardiovascular-disease-prediction-lac.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "message": "Cardiovascular Disease Prediction API is running",
        "models_trained": model.IS_TRAINED,
        "available_models": get_available_models()
    }


@app.get("/models")
def list_models():
    """
    Returns the list of all available classification models.
    """
    return {
        "models": get_available_models()
    }


@app.get("/models/results", response_model=ModelResultsResponse)
def get_all_model_results():
    """
    Returns evaluation metrics for every classification model.

    Includes:
    - Accuracy
    - Precision
    - Recall
    - F1-Score
    - Train Score
    - Test Score
    - 5-Fold Cross Validation Mean
    - CV Standard Deviation
    - Fit Status
    """
    return get_model_results()


@app.get("/models/{model_name}")
def get_single_model_detail(model_name: str):
    """
    Returns detailed metrics and hyperparameter tuning data
    for a specific model.
    """
    detail = get_model_details(model_name)

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Invalid model selected: '{model_name}'. "
                f"Available: {get_available_models()}"
            )
        )

    return detail


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Performs cardiovascular disease prediction using
    the requested classification model.

    Accepts patient features:
    age, gender, height, weight, ap_hi, ap_lo,
    cholesterol, gluc, smoke, alco, active.
    """
    try:
        features_dict = request.get_features_dict()

    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )

    try:
        model_name = request.model or "Random Forest"

        result = predict_disease(
            model_name,
            features_dict
        )

        return result

    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )