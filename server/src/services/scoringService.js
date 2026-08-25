import { determineVerdict, SCORING_THRESHOLDS } from "../config/scoring.js";

export const scoringService = {
  calculateScore(verificationResult) {
    const { overallScore, layers } = verificationResult;
    const verdict = determineVerdict(overallScore, layers);

    return {
      overallScore,
      verdict,
      thresholds: SCORING_THRESHOLDS,
    };
  },
};
