import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const aiService = {
  async verify({ filePath, docType }) {
    if (!env.PYTHON_AI_URL) {
      logger.info(`[aiService] Operating in STUB mode for docType: ${docType}`);

      // Return fixed stub result as specified by spec
      return {
        docType: docType || "PASSPORT",
        extracted: {
          name: "STUB NAME",
          docNumber: "STUB123456",
          dob: "1990-01-01",
          nationality: "IND",
          expiry: "2030-01-01",
          gender: "M",
        },
        layers: {
          ocr: { passed: true, confidence: 0.9, notes: "Extracted MRZ text lines successfully." },
          validation: { passed: true, confidence: 1.0, notes: "Doc number and expiry checksums valid." },
          tampering: { passed: true, confidence: 0.9, notes: "No digital copy-move or ELA anomalies." },
          face: { passed: true, confidence: 0.9, notes: "Document photo matches facial biometric embedding." },
        },
        overallScore: 0.9,
        verdict: "PASS",
        engineVersion: "stub-0.1",
      };
    }

    try {
      logger.info(`[aiService] Calling live Python AI service at ${env.PYTHON_AI_URL}/scan`);
      const formData = new FormData();
      formData.append("id_image", fs.createReadStream(filePath));
      formData.append("doc_type", docType || "AADHAAR");

      const response = await axios.post(`${env.PYTHON_AI_URL}/scan`, formData, {
        headers: {
          ...formData.getHeaders(),
          "X-API-Key": env.AI_API_KEY
        },
        timeout: 25000,
      });

      const aiData = response.data;
      const isFormatValid = aiData.ocr?.is_valid_format || false;
      const isTampered = aiData.tampering?.is_tampered || false;

      let score = 1.0;
      if (!isFormatValid) score -= 0.4;
      if (isTampered) score -= 0.3;

      let verdict = "PASS";
      if (score < 0.5) verdict = "FAIL";
      else if (score < 0.8) verdict = "REVIEW";

      return {
        docType: docType || "AADHAAR",
        extracted: {
          name: aiData.ocr?.mrz_parsed?.surname
            ? `${aiData.ocr.mrz_parsed.given_name || ""} ${aiData.ocr.mrz_parsed.surname}`.trim()
            : aiData.ocr?.texts_extracted?.[0] || "EXTRACTED_NAME",
          docNumber: aiData.ocr?.mrz_parsed?.document_number || "N/A",
          dob: aiData.ocr?.mrz_parsed?.date_of_birth || "N/A",
          nationality: aiData.ocr?.mrz_parsed?.nationality || "IND",
          expiry: aiData.ocr?.mrz_parsed?.expiration_date || "N/A",
          gender: aiData.ocr?.mrz_parsed?.sex || "N/A",
        },
        layers: {
          ocr: {
            passed: isFormatValid,
            confidence: isFormatValid ? 0.95 : 0.4,
            notes: isFormatValid ? "Document format & text valid." : "Invalid document structure."
          },
          validation: {
            passed: isFormatValid,
            confidence: isFormatValid ? 1.0 : 0.0,
            notes: "Format validation"
          },
          tampering: {
            passed: !isTampered,
            confidence: parseFloat((1.0 - (aiData.tampering?.deep_model_prob || 0)).toFixed(2)),
            notes: isTampered ? "Digital tampering / ELA anomaly detected." : "No digital copy-move or ELA anomalies."
          },
          face: { passed: true, confidence: 1.0, notes: "Face check not run (no selfie)" },
        },
        overallScore: score,
        verdict: verdict,
        engineVersion: "python-ai-1.0",
      };
    } catch (err) {
      logger.error(`[aiService] Live AI service request failed: ${err.message}`);
      throw new Error(`AI Verification service unavailable: ${err.message}`);
    }
  },

  async checkHealth() {
    if (!env.PYTHON_AI_URL) {
      return { status: "stub", reachable: true };
    }
    try {
      await axios.get(`${env.PYTHON_AI_URL}/`, { timeout: 3000 });
      return { status: "live", reachable: true };
    } catch (_err) {
      return { status: "live", reachable: false };
    }
  },
};
