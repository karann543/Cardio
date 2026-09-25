import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Fetch list of all available classification models.
 * @returns {Promise<string[]>} Array of model names
 */
export const getModels = async () => {
  const response = await axios.get(`${API_URL}/models`);
  return response.data.models;
};

/**
 * Fetch full Task 5 evaluation metrics for all models (CV mean, std, fit status, accuracy, etc.)
 * @returns {Promise<Object>} Object containing models array, best_model, cv_folds, and tuning info
 */
export const getModelResults = async () => {
  const response = await axios.get(`${API_URL}/models/results`);
  return response.data;
};

/**
 * Fetch detailed metrics and hyperparameter tuning for a specific model.
 * @param {string} modelName - Name of the model (e.g. "Random Forest")
 * @returns {Promise<Object>} Detailed metrics object
 */
export const getModelDetails = async (modelName) => {
  const response = await axios.get(`${API_URL}/models/${encodeURIComponent(modelName)}`);
  return response.data;
};

/**
 * Send prediction request with selected model and patient features.
 * @param {string} model - Selected model name
 * @param {Object} features - Patient clinical features
 * @returns {Promise<Object>} Prediction result with prediction, probability, and confidence
 */
export const predictDisease = async (model, features) => {
  const response = await axios.post(`${API_URL}/predict`, {
    model,
    features
  });
  return response.data;
};

/**
 * Backward-compatible helper for legacy form callers.
 * Accepts either flat data or wrapped object.
 */
export const predictCardiovascularDisease = async (data) => {
  // If data already has model and features
  if (data.features) {
    return predictDisease(data.model || 'Random Forest', data.features);
  }
  // Otherwise wrap as features
  const { model, ...features } = data;
  return predictDisease(model || 'Random Forest', features);
};

/**
 * Check root health status of the ML backend.
 * @returns {Promise<Object>}
 */
export const checkHealthStatus = async () => {
  const response = await axios.get(`${API_URL}/`);
  return response.data;
};
