/**
 * Fallback data for the Model Performance dashboard.
 * Mirrors the shape of GET /metrics from the potato disease detection model API,
 * used when that service is unreachable (e.g. cold start / network error).
 */
export const MOCK_MODEL_METRICS = {
  test_accuracy: 98.73,
  classes: {
    Background: { precision: 1.0, recall: 1.0, f1_score: 1.0, support: 54 },
    Potato___Late_blight: { precision: 1.0, recall: 0.97, f1_score: 0.98, support: 97 },
    Potato___healthy: { precision: 0.97, recall: 1.0, f1_score: 0.98, support: 85 },
  },
  summary: {
    accuracy: { f1_score: 0.99, support: 236 },
    macro_avg: { precision: 0.99, recall: 0.99, f1_score: 0.99, support: 236 },
    weighted_avg: { precision: 0.99, recall: 0.99, f1_score: 0.99, support: 236 },
  },
};
