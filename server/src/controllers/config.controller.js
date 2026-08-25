import { DOC_TYPES } from "../config/docTypes.js";
import { SCORING_THRESHOLDS } from "../config/scoring.js";
import { sendSuccess } from "../utils/responseEnvelope.js";

export const configController = {
  getDocTypes(_req, res) {
    return sendSuccess(res, DOC_TYPES);
  },

  getScoringConfig(_req, res) {
    return sendSuccess(res, SCORING_THRESHOLDS);
  },
};
