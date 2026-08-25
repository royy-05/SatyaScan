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
      logger.info(`[aiService] Calling live Python AI service at ${env.PYTHON_AI_URL}/verify`);
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      formData.append("docType", docType);

      const response = await axios.post(`${env.PYTHON_AI_URL}/verify`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000,
      });

      return response.data;
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
      await axios.get(`${env.PYTHON_AI_URL}/health`, { timeout: 3000 });
      return { status: "live", reachable: true };
    } catch (_err) {
      return { status: "live", reachable: false };
    }
  },
};
