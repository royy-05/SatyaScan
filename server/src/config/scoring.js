export const SCORING_THRESHOLDS = {
  PASS_MAX_RISK: 30,
  REVIEW_MAX_RISK: 70,
};

export function determineVerdict(overallScore, layerResults = {}) {
  const hasLayerFailure = Object.values(layerResults).some(
    (layer) => layer && layer.passed === false
  );

  // If a layer explicitly failed, at least force a REVIEW
  if (hasLayerFailure) {
    if (overallScore >= SCORING_THRESHOLDS.REVIEW_MAX_RISK) {
      return "FAIL";
    }
    return "REVIEW";
  }

  if (overallScore >= SCORING_THRESHOLDS.REVIEW_MAX_RISK) {
    return "FAIL";
  } else if (overallScore >= SCORING_THRESHOLDS.PASS_MAX_RISK) {
    return "REVIEW";
  } else {
    return "PASS";
  }
}
