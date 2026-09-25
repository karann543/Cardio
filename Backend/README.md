# Cardiovascular Disease Prediction - Task 5 Machine Learning System

A complete implementation of the **Task 5 Classification Checklist** for cardiovascular disease prediction, connected to a FastAPI backend and a React frontend.

---

## 🚀 Key Highlights & Task 5 Compliance

- **No Pre-trained Artifact Files (`.pkl` / `.joblib`)**: Models are trained directly and transparently. In `model.ipynb`, all training and evaluation steps are executed with full outputs. The FastAPI backend trains the 4 pipelines in-memory on startup (~15 seconds) and retains them for real-time predictions.
- **Model Evaluation**: Full calculation of **Accuracy**, **Precision**, **Recall**, and **F1-Score**.
- **Overfitting / Underfitting Check**: Evaluates generalization gap between Train and Test scores:
  - *Possible Overfitting*: Train score > 5% higher than Test score.
  - *Possible Underfitting*: Both Train and Test scores < 65%.
  - *Good Fit*: Train and Test scores are close and balanced.
- **5-Fold Cross Validation**: Evaluates model stability using **CV Mean** and **CV Standard Deviation** (spread).
- **All Models Compared**:
  1. Logistic Regression (with `StandardScaler`)
  2. Random Forest (Ensemble Bagging)
  3. AdaBoost (Ensemble Boosting)
  4. Gradient Boosting (Gradient Boosted Trees)
- **Hyperparameter Tuning**: Automatic selection of the model with the highest CV Mean score, tuned using `GridSearchCV`, with before vs. after comparison on the untouched test set.
- **Dynamic React Frontend**: Dashboard, Model Comparison table, Model Details & Tuning breakdown, and Clinical Prediction form with dynamic model selection.

---

## 📁 Project Structure

```
ML Backend/
├── model.ipynb             # Main ML pipeline (executed with all Task 5 outputs)
├── cardio_train.csv        # Clinical dataset (70,000 patient records)
├── main.py                 # FastAPI application with REST endpoints & CORS
├── model.py                # Backend in-memory ML module (training, evaluation, tuning, prediction)
├── schemas.py              # Pydantic schemas for requests and responses
├── requirements.txt        # Python dependencies
├── README.md               # Documentation & demonstration guide
└── frontend/               # React + Vite frontend source code
```

---

## 🛠️ How to Run the Project

### Step 1: Start the Backend API

Open a terminal in `ML Backend`:

```bash
# If using existing virtual environment:
.\venv\Scripts\uvicorn main:app --reload --port 8000

# Or standard python:
uvicorn main:app --reload --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

> *Note: On startup, the backend automatically trains all 4 models and runs 5-fold cross-validation in-memory. This takes ~15 seconds.*

---

### Step 2: Start the React Frontend

Open a second terminal in `e:\ML frontend` (or `e:\ML Backend\frontend`):

```bash
cd "e:\ML frontend"
npm run dev
```

- Frontend URL: `http://localhost:5173`

---

## 📡 API Endpoints Reference

### 1. `GET /models`
Returns list of available classification models:
```json
{
  "models": [
    "Logistic Regression",
    "Random Forest",
    "AdaBoost",
    "Gradient Boosting"
  ]
}
```

### 2. `GET /models/results`
Returns complete Task 5 evaluation metrics for all models:
```json
{
  "models": [
    {
      "name": "Gradient Boosting",
      "accuracy": 0.7307,
      "precision": 0.7482,
      "recall": 0.7005,
      "f1_score": 0.7223,
      "train_score": 0.7396,
      "test_score": 0.7307,
      "cv_mean": 0.7360,
      "cv_std": 0.0033,
      "fit_status": "Good fit"
    },
    ...
  ],
  "best_model": "Gradient Boosting",
  "cv_folds": 5,
  "tuning": {
    "model_name": "Gradient Boosting",
    "best_params": { "learning_rate": 0.1, "max_depth": 4, "n_estimators": 75 },
    "before_tuning_score": 0.7307,
    "after_tuning_score": 0.7337,
    "improvement": 0.0030,
    "improvement_percent": "+0.30%"
  }
}
```

### 3. `GET /models/{model_name}`
Returns deep-dive evaluation and tuning details for a specific model (e.g. `GET /models/Random%20Forest`).

### 4. `POST /predict`
Accepts patient clinical features and performs real-time disease prediction using the selected model:

**Request Body:**
```json
{
  "model": "Random Forest",
  "features": {
    "age": 55.0,
    "gender": 2,
    "height": 172.0,
    "weight": 85.0,
    "ap_hi": 140.0,
    "ap_lo": 90.0,
    "cholesterol": 2,
    "gluc": 1,
    "smoke": 1,
    "alco": 0,
    "active": 1
  }
}
```

**Response:**
```json
{
  "model": "Random Forest",
  "prediction": "Cardiovascular Disease Detected",
  "prediction_code": 1,
  "probability": 0.7420,
  "confidence": 74.2,
  "message": "Prediction successful"
}
```

---

## 🎓 Teacher Demonstration Walkthrough

When presenting this project to your instructor, follow these steps:

1. **Open `model.ipynb`**:
   - Show that the notebook is divided into clear numbered sections from data loading to final tuning.
   - Point out that **no pre-trained `.pkl` or `.joblib` files** are created.
   - Show the **Model Comparison Table** displaying Accuracy, Precision, Recall, F1, Train Score, Test Score, CV Mean, CV Std, and Fit Status.
   - Show the **Hyperparameter Tuning** section demonstrating the best parameter search and test set improvement.

2. **Open Dashboard (`http://localhost:5173`)**:
   - Show the high-level cards: Total Models (4), Models Tested (4), Best Model, and 5-Fold Cross Validation.
   - Point out that cards are dynamically populated via `GET /models/results`.

3. **Open Model Comparison (`http://localhost:5173/comparison`)**:
   - Walk through the matrix table comparing Logistic Regression, Random Forest, AdaBoost, and Gradient Boosting.
   - Explain the **Overfitting / Underfitting** logic (Train vs Test gap) and **CV Std** stability analysis.

4. **Open Model Details (`http://localhost:5173/details`)**:
   - Switch between models using the top tabs.
   - Show the **Discovered Optimal Parameters** and the **Before vs. After Tuning score comparison**.

5. **Open Prediction (`http://localhost:5173/prediction`)**:
   - Click **"Low Risk Patient"** or **"High Risk Patient"** presets to populate the 11 clinical features.
   - Select **Random Forest** and click **Predict Disease**. View the predicted disease label and confidence percentage.
   - Change the model dropdown to **Logistic Regression**, **AdaBoost**, or **Gradient Boosting** and click **Predict Disease** again to demonstrate that the backend dynamically switches and executes whichever model the user selects.
