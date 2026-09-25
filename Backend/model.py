import os
import time
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score,
    GridSearchCV
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (
    RandomForestClassifier,
    AdaBoostClassifier,
    GradientBoostingClassifier
)
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "cardio_train.csv"
)

ARTIFACT_PATH = os.path.join(
    BASE_DIR,
    "ml_artifacts.joblib"
)


# ============================================================
# FEATURE CONFIGURATION
# ============================================================

FEATURE_COLUMNS = [
    "age",
    "gender",
    "height",
    "weight",
    "ap_hi",
    "ap_lo",
    "cholesterol",
    "gluc",
    "smoke",
    "alco",
    "active"
]

RANDOM_STATE = 42


# ============================================================
# GLOBAL MODEL STORAGE
# ============================================================

TRAINED_MODELS = {}

MODEL_RESULTS = []

MODEL_RESULTS_DICT = {}

BEST_MODEL_NAME = ""

TUNING_RESULTS = {}

IS_TRAINED = False


# ============================================================
# DATA LOADING AND PREPROCESSING
# ============================================================

def load_and_preprocess_data(dataset_path: str = DATASET_PATH):
    """
    Loads cardio_train.csv, drops non-predictive columns,
    and converts age from days to years.
    """

    df = pd.read_csv(dataset_path)

    X = df.drop(
        columns=["cardio", "id"]
    ).copy()

    y = df["cardio"]

    # Convert age from days to years
    X["age"] = X["age"] / 365.25

    return X, y


# ============================================================
# BASE MODELS
# ============================================================

def get_base_models():
    """
    Defines the classification pipelines.

    Each model uses StandardScaler followed by
    its respective classification algorithm.
    """

    return {

        "Logistic Regression": Pipeline([
            (
                "scaler",
                StandardScaler()
            ),
            (
                "model",
                LogisticRegression(
                    max_iter=500,
                    random_state=RANDOM_STATE
                )
            )
        ]),

        "Random Forest": Pipeline([
            (
                "scaler",
                StandardScaler()
            ),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=60,
                    max_depth=10,
                    random_state=RANDOM_STATE,
                    n_jobs=-1
                )
            )
        ]),

        "AdaBoost": Pipeline([
            (
                "scaler",
                StandardScaler()
            ),
            (
                "model",
                AdaBoostClassifier(
                    n_estimators=50,
                    random_state=RANDOM_STATE
                )
            )
        ]),

        "Gradient Boosting": Pipeline([
            (
                "scaler",
                StandardScaler()
            ),
            (
                "model",
                GradientBoostingClassifier(
                    n_estimators=50,
                    max_depth=3,
                    random_state=RANDOM_STATE
                )
            )
        ])
    }


# ============================================================
# FIT STATUS
# ============================================================

def determine_fit_status(
    train_score: float,
    test_score: float
) -> str:
    """
    Determines whether the model appears to be
    overfitting, underfitting, or fitting well.
    """

    gap = train_score - test_score

    if gap > 0.05:
        return "Possible overfitting"

    elif (
        train_score < 0.65
        and test_score < 0.65
    ):
        return "Possible underfitting"

    else:
        return "Good fit"


# ============================================================
# TRAINING FUNCTION
# ============================================================

def _train_ml_models(
    dataset_path: str = DATASET_PATH
):
    """
    Performs the complete ML training process.

    This function is intended to run only when
    ml_artifacts.joblib does not exist.

    It performs:

    1. Dataset loading
    2. Train/test split
    3. 5-fold Stratified Cross Validation
    4. Training of four models
    5. Model evaluation
    6. Best-model selection
    7. GridSearchCV hyperparameter tuning
    8. Saving trained models and results
    """

    global TRAINED_MODELS
    global MODEL_RESULTS
    global MODEL_RESULTS_DICT
    global BEST_MODEL_NAME
    global TUNING_RESULTS
    global IS_TRAINED

    print(
        "[ML] Starting one-time model training..."
    )

    start_time = time.time()

    # Reset global storage
    TRAINED_MODELS = {}
    MODEL_RESULTS = []
    MODEL_RESULTS_DICT = {}
    BEST_MODEL_NAME = ""
    TUNING_RESULTS = {}
    IS_TRAINED = False

    # ========================================================
    # 1. LOAD DATA
    # ========================================================

    print("[ML] Loading dataset...")

    X, y = load_and_preprocess_data(
        dataset_path
    )

    # ========================================================
    # 2. TRAIN / TEST SPLIT
    # ========================================================

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y
    )

    # ========================================================
    # 3. CROSS VALIDATION
    # ========================================================

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=RANDOM_STATE
    )

    models = get_base_models()

    results = []

    results_dict = {}

    # ========================================================
    # 4. TRAIN AND EVALUATE ALL MODELS
    # ========================================================

    for name, model in models.items():

        m_start = time.time()

        print(
            f"[ML] Training {name}..."
        )

        # Train
        model.fit(
            X_train,
            y_train
        )

        # Training predictions
        train_pred = model.predict(
            X_train
        )

        # Testing predictions
        test_pred = model.predict(
            X_test
        )

        # ----------------------------------------------------
        # Metrics
        # ----------------------------------------------------

        train_acc = float(
            accuracy_score(
                y_train,
                train_pred
            )
        )

        test_acc = float(
            accuracy_score(
                y_test,
                test_pred
            )
        )

        prec = float(
            precision_score(
                y_test,
                test_pred,
                zero_division=0
            )
        )

        rec = float(
            recall_score(
                y_test,
                test_pred,
                zero_division=0
            )
        )

        f1 = float(
            f1_score(
                y_test,
                test_pred,
                zero_division=0
            )
        )

        # ----------------------------------------------------
        # 5-Fold Cross Validation
        # ----------------------------------------------------

        cv_scores = cross_val_score(
            model,
            X_train,
            y_train,
            cv=cv,
            scoring="accuracy",
            n_jobs=-1
        )

        cv_mean = float(
            cv_scores.mean()
        )

        cv_std = float(
            cv_scores.std()
        )

        fit_status = determine_fit_status(
            train_acc,
            test_acc
        )

        # ----------------------------------------------------
        # Result object
        # ----------------------------------------------------

        metric_entry = {
            "name": name,
            "accuracy": round(
                test_acc,
                4
            ),
            "precision": round(
                prec,
                4
            ),
            "recall": round(
                rec,
                4
            ),
            "f1_score": round(
                f1,
                4
            ),
            "train_score": round(
                train_acc,
                4
            ),
            "test_score": round(
                test_acc,
                4
            ),
            "cv_mean": round(
                cv_mean,
                4
            ),
            "cv_std": round(
                cv_std,
                4
            ),
            "fit_status": fit_status
        }

        results.append(
            metric_entry
        )

        results_dict[name] = metric_entry

        TRAINED_MODELS[name] = model

        print(
            f"[ML] {name:20s} | "
            f"Test Acc: {test_acc:.4f} | "
            f"CV Mean: {cv_mean:.4f} "
            f"(std: {cv_std:.4f}) | "
            f"Fit: {fit_status} "
            f"({time.time() - m_start:.2f}s)"
        )

    # ========================================================
    # 5. SORT MODEL RESULTS
    # ========================================================

    results.sort(
        key=lambda r: (
            -r["cv_mean"],
            r["cv_std"]
        )
    )

    MODEL_RESULTS = results

    MODEL_RESULTS_DICT = results_dict

    # ========================================================
    # 6. SELECT BEST MODEL
    # ========================================================

    BEST_MODEL_NAME = results[0]["name"]

    best_base_model = TRAINED_MODELS[
        BEST_MODEL_NAME
    ]

    print(
        f"[ML] Selected model for tuning: "
        f"{BEST_MODEL_NAME} "
        f"(CV Mean: "
        f"{results[0]['cv_mean']:.4f})"
    )

    # ========================================================
    # 7. HYPERPARAMETER TUNING
    # ========================================================

    tuning_grids = {

        "Gradient Boosting": {
            "model__n_estimators": [
                50,
                75
            ],
            "model__learning_rate": [
                0.05,
                0.1
            ],
            "model__max_depth": [
                3,
                4
            ]
        },

        "Random Forest": {
            "model__n_estimators": [
                50,
                80
            ],
            "model__max_depth": [
                8,
                12
            ],
            "model__min_samples_split": [
                2,
                5
            ]
        },

        "AdaBoost": {
            "model__n_estimators": [
                50,
                80
            ],
            "model__learning_rate": [
                0.05,
                0.1,
                0.2
            ]
        },

        "Logistic Regression": {
            "model__C": [
                0.1,
                1.0,
                5.0
            ],
            "model__solver": [
                "lbfgs"
            ]
        }
    }

    grid = tuning_grids.get(
        BEST_MODEL_NAME,
        {
            "model__n_estimators": [
                50,
                75
            ],
            "model__learning_rate": [
                0.05,
                0.1
            ]
        }
    )

    print(
        f"[ML] Starting GridSearchCV "
        f"for {BEST_MODEL_NAME}..."
    )

    tune_search = GridSearchCV(
        estimator=best_base_model,
        param_grid=grid,
        cv=cv,
        scoring="accuracy",
        n_jobs=-1
    )

    tune_search.fit(
        X_train,
        y_train
    )

    # ========================================================
    # 8. EVALUATE TUNED MODEL
    # ========================================================

    tuned_model = (
        tune_search.best_estimator_
    )

    tuned_test_pred = tuned_model.predict(
        X_test
    )

    after_tuning_score = float(
        accuracy_score(
            y_test,
            tuned_test_pred
        )
    )

    before_tuning_score = (
        results_dict[
            BEST_MODEL_NAME
        ]["test_score"]
    )

    diff = round(
        after_tuning_score
        - before_tuning_score,
        4
    )

    # ========================================================
    # 9. CLEAN BEST PARAMETERS
    # ========================================================

    clean_params = {
        key.replace(
            "model__",
            ""
        ): value
        for key, value
        in tune_search.best_params_.items()
    }

    # ========================================================
    # 10. TUNING RESULTS
    # ========================================================

    TUNING_RESULTS = {

        "model_name": BEST_MODEL_NAME,

        "best_params": clean_params,

        "before_tuning_score": round(
            before_tuning_score,
            4
        ),

        "after_tuning_score": round(
            after_tuning_score,
            4
        ),

        "improvement": diff,

        "improvement_percent":
            f"{diff * 100:+.2f}%",

        "best_cv_score": round(
            float(
                tune_search.best_score_
            ),
            4
        ),

        "tuned_precision": round(
            float(
                precision_score(
                    y_test,
                    tuned_test_pred,
                    zero_division=0
                )
            ),
            4
        ),

        "tuned_recall": round(
            float(
                recall_score(
                    y_test,
                    tuned_test_pred,
                    zero_division=0
                )
            ),
            4
        ),

        "tuned_f1": round(
            float(
                f1_score(
                    y_test,
                    tuned_test_pred,
                    zero_division=0
                )
            ),
            4
        )
    }

    # ========================================================
    # 11. STORE TUNED MODEL
    # ========================================================

    TRAINED_MODELS[
        f"{BEST_MODEL_NAME} (Tuned)"
    ] = tuned_model

    # ========================================================
    # 12. MARK AS TRAINED
    # ========================================================

    IS_TRAINED = True

    print(
        f"[ML] Hyperparameter tuning completed."
    )

    print(
        f"[ML] Best Params: {clean_params}"
    )

    print(
        f"[ML] Score Before: "
        f"{before_tuning_score:.4f} | "
        f"After: "
        f"{after_tuning_score:.4f} | "
        f"Diff: {diff:+.4f}"
    )

    # ========================================================
    # 13. SAVE EVERYTHING
    # ========================================================

    artifact = {

        "TRAINED_MODELS":
            TRAINED_MODELS,

        "MODEL_RESULTS":
            MODEL_RESULTS,

        "MODEL_RESULTS_DICT":
            MODEL_RESULTS_DICT,

        "BEST_MODEL_NAME":
            BEST_MODEL_NAME,

        "TUNING_RESULTS":
            TUNING_RESULTS,

        "IS_TRAINED":
            IS_TRAINED
    }

    joblib.dump(
        artifact,
        ARTIFACT_PATH
    )

    elapsed_time = (
        time.time() - start_time
    )

    print(
        f"[ML] Training completed in "
        f"{elapsed_time:.2f}s"
    )

    print(
        f"[ML] Saved trained models to: "
        f"{ARTIFACT_PATH}"
    )


# ============================================================
# LOAD OR TRAIN MODELS
# ============================================================

def init_ml_models(
    dataset_path: str = DATASET_PATH
):
    """
    Loads pre-trained models from ml_artifacts.joblib.

    If the artifact file does not exist,
    models are trained once and saved.
    """

    global TRAINED_MODELS
    global MODEL_RESULTS
    global MODEL_RESULTS_DICT
    global BEST_MODEL_NAME
    global TUNING_RESULTS
    global IS_TRAINED

    # --------------------------------------------------------
    # If saved model exists, load it
    # --------------------------------------------------------

    if os.path.exists(
        ARTIFACT_PATH
    ):

        print(
            "[ML] Loading pre-trained models..."
        )

        try:

            artifact = joblib.load(
                ARTIFACT_PATH
            )

            TRAINED_MODELS = (
                artifact["TRAINED_MODELS"]
            )

            MODEL_RESULTS = (
                artifact["MODEL_RESULTS"]
            )

            MODEL_RESULTS_DICT = (
                artifact["MODEL_RESULTS_DICT"]
            )

            BEST_MODEL_NAME = (
                artifact["BEST_MODEL_NAME"]
            )

            TUNING_RESULTS = (
                artifact["TUNING_RESULTS"]
            )

            IS_TRAINED = (
                artifact["IS_TRAINED"]
            )

            print(
                "[ML] Pre-trained models "
                "loaded successfully."
            )

            print(
                f"[ML] Available models: "
                f"{list(TRAINED_MODELS.keys())}"
            )

            return

        except Exception as e:

            print(
                f"[ML] Error loading saved "
                f"models: {e}"
            )

            print(
                "[ML] Re-training models..."
            )

    # --------------------------------------------------------
    # No saved model found
    # --------------------------------------------------------

    print(
        "[ML] No saved model artifact found."
    )

    print(
        "[ML] Training models for the "
        "first time..."
    )

    _train_ml_models(
        dataset_path
    )


# ============================================================
# AVAILABLE MODELS
# ============================================================

def get_available_models():
    """
    Returns list of all available base models.
    """

    if not IS_TRAINED:
        init_ml_models()

    return [
        name
        for name in [
            "Logistic Regression",
            "Random Forest",
            "AdaBoost",
            "Gradient Boosting"
        ]
        if name in TRAINED_MODELS
    ]


# ============================================================
# MODEL RESULTS
# ============================================================

def get_model_results():
    """
    Returns evaluation results for all models.
    """

    if not IS_TRAINED:
        init_ml_models()

    return {

        "models":
            MODEL_RESULTS,

        "best_model":
            BEST_MODEL_NAME,

        "cv_folds":
            5,

        "tuning":
            TUNING_RESULTS
    }


# ============================================================
# MODEL DETAILS
# ============================================================

def get_model_details(
    model_name: str
):
    """
    Returns complete metrics and tuning
    information for a specific model.
    """

    if not IS_TRAINED:
        init_ml_models()

    if model_name not in MODEL_RESULTS_DICT:
        return None

    detail = dict(
        MODEL_RESULTS_DICT[
            model_name
        ]
    )

    if model_name == BEST_MODEL_NAME:

        detail["tuning"] = (
            TUNING_RESULTS
        )

    else:

        detail["tuning"] = None

    return detail


# ============================================================
# PREDICTION
# ============================================================

def predict_disease(
    model_name: str,
    features: dict
):
    """
    Performs cardiovascular disease prediction.

    Accepts 11 clinical features and returns:
    - model
    - prediction
    - prediction code
    - probability
    - confidence
    - message
    """

    if not IS_TRAINED:
        init_ml_models()

    # --------------------------------------------------------
    # Validate model
    # --------------------------------------------------------

    if model_name not in TRAINED_MODELS:

        raise ValueError(
            f"Invalid model selected: "
            f"'{model_name}'. "
            f"Available: "
            f"{get_available_models()}"
        )

    model = TRAINED_MODELS[
        model_name
    ]

    # --------------------------------------------------------
    # Validate features
    # --------------------------------------------------------

    missing = [
        feature
        for feature in FEATURE_COLUMNS
        if feature not in features
    ]

    if missing:

        raise ValueError(
            "Missing required feature(s): "
            + ", ".join(missing)
        )

    # --------------------------------------------------------
    # Create input DataFrame
    # --------------------------------------------------------

    row_data = {
        column: [
            float(
                features[column]
            )
        ]
        for column in FEATURE_COLUMNS
    }

    input_df = pd.DataFrame(
        row_data
    )

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    pred_code = int(
        model.predict(
            input_df
        )[0]
    )

    # --------------------------------------------------------
    # Probability / confidence
    # --------------------------------------------------------

    probability = None

    confidence = None

    if hasattr(
        model,
        "predict_proba"
    ):

        probs = model.predict_proba(
            input_df
        )[0]

        # Positive class probability
        pos_prob = (
            float(probs[1])
            if len(probs) > 1
            else float(probs[0])
        )

        probability = round(
            pos_prob,
            4
        )

        # Probability of predicted class
        pred_prob = float(
            probs[pred_code]
        )

        confidence = round(
            pred_prob * 100,
            1
        )

    # --------------------------------------------------------
    # Prediction label
    # --------------------------------------------------------

    prediction_label = (
        "Cardiovascular Disease Detected"
        if pred_code == 1
        else
        "No Cardiovascular Disease Detected"
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "model":
            model_name,

        "prediction":
            prediction_label,

        "prediction_code":
            pred_code,

        "probability":
            probability,

        "confidence":
            confidence,

        "message":
            "Prediction successful"
    }