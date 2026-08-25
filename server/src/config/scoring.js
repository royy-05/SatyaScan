export const SCORING_THRESHOLDS = {
  PASS_MIN: 0.85,
  REVIEW_MIN: 0.60,
};

export function determineVerdict(overallScore, layerResults = {}) {
  const hasLayerFailure = Object.values(layerResults).some(
    (layer) => layer && layer.passed === false
  );

  if (hasLayerFailure) {
    if (overallScore < SCORING_THRESHOLDS.REVIEW_MIN) {
      return "FAIL";
    }
    return "REVIEW";
  }

  if (overallScore >= SCORING_THRESHOLDS.PASS_MIN) {
    return "PASS";
  } else if (overallScore >= SCORING_THRESHOLDS.REVIEW_MIN) {
    return "REVIEW";
  } else {
    return "FAIL";
  }
}
