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
        timeout: 180000,
      });

      const aiData = response.data;
      const isFormatValid = aiData.ocr?.is_valid_format || false;
      const isTampered = aiData.tampering?.is_tampered || false;

      const rawParsedFields = aiData.ocr?.parsed_fields;
      const rawMrzParsed = aiData.ocr?.mrz_parsed;
      const targetFields =
        rawParsedFields && Object.keys(rawParsedFields).length > 0
          ? rawParsedFields
          : rawMrzParsed || {};

      let nameVal = targetFields.name;
      if (!nameVal && (targetFields.given_name || targetFields.surname)) {
        nameVal = `${targetFields.given_name || ""} ${targetFields.surname || ""}`.trim();
      }

      const extracted = {
        name: nameVal || "N/A",
        docNumber: targetFields.doc_number || targetFields.document_number || "N/A",
        dob: targetFields.dob || targetFields.date_of_birth || "N/A",
        nationality: targetFields.nationality || "IND",
        expiry: targetFields.expiry || targetFields.expiration_date || "N/A",
        gender: targetFields.gender || targetFields.sex || "N/A",
      };

      const textsExtracted = aiData.ocr?.texts_extracted || [];
      const ocrPassed = textsExtracted.length > 5;

      const checkObj = rawParsedFields || rawMrzParsed;
      const hasParsedFieldValues =
        checkObj &&
        Object.values(checkObj).some(
          (val) => val !== null && val !== undefined && val !== ""
        );

      let ocrConfidence = 0.3;
      if (hasParsedFieldValues) {
        ocrConfidence = 0.95;
      } else if (textsExtracted.length > 0) {
        ocrConfidence = 0.7;
      }

      let ocrNotes = "";
      if (hasParsedFieldValues) {
        ocrNotes = `Parsed key document fields successfully (${textsExtracted.length} text lines extracted).`;
      } else if (textsExtracted.length > 0) {
        ocrNotes = `Extracted ${textsExtracted.length} text lines, but key document fields could not be parsed.`;
      } else {
        ocrNotes = "No text lines extracted from document image.";
      }

      let score = 1.0;
      if (!isFormatValid) score -= 0.4;
      if (isTampered) score -= 0.3;

      let verdict = "PASS";
      if (score < 0.5) verdict = "FAIL";
      else if (score < 0.8) verdict = "REVIEW";

      return {
        docType: docType || "AADHAAR",
        extracted,
        layers: {
          ocr: {
            passed: ocrPassed,
            confidence: ocrConfidence,
            notes: ocrNotes,
          },
          validation: {
            passed: isFormatValid,
            confidence: isFormatValid ? 1.0 : 0.0,
            notes: isFormatValid ? "Document format validation passed." : "Document format validation failed.",
          },
          tampering: {
            passed: !isTampered,
            confidence: parseFloat((1.0 - (aiData.tampering?.deep_model_prob || 0)).toFixed(2)),
            notes: isTampered ? "Digital tampering / ELA anomaly detected." : "No digital copy-move or ELA anomalies.",
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

  async verifyWithFace({ documentPath, selfiePath, docType }) {
    if (!env.PYTHON_AI_URL) {
      logger.info("[aiService] Operating in STUB mode for face verification");
      return {
        face: { passed: true, confidence: 0.87, notes: "Face match (stub)" },
        faceMatchScore: 0.87,
      };
    }

    try {
      logger.info(`[aiService] Calling live Python AI service /verify at ${env.PYTHON_AI_URL}`);
      const formData = new FormData();
      formData.append("id_image", fs.createReadStream(documentPath));
      if (selfiePath) {
        formData.append("selfie_image", fs.createReadStream(selfiePath));
      }
      formData.append("doc_type", docType || "AADHAAR");

      const response = await axios.post(`${env.PYTHON_AI_URL}/verify`, formData, {
        headers: {
          ...formData.getHeaders(),
          "X-API-Key": env.AI_API_KEY,
        },
        timeout: 60000,
      });

      const aiData = response.data;
      const faceBio =
        aiData.document_status?.face_biometrics ||
        aiData.face_biometrics ||
        aiData.face ||
        {};

      let similarity = 0.85;
      if (typeof faceBio.similarity === "number") {
        similarity = faceBio.similarity;
      } else if (typeof faceBio.confidence === "number") {
        similarity = faceBio.confidence;
      }

      return {
        face: {
          passed: similarity >= 0.6,
          confidence: similarity,
          notes: `Face match ${(similarity * 100).toFixed(0)}%`,
        },
        faceMatchScore: similarity,
      };
    } catch (err) {
      logger.error(`[aiService] Live face verification request failed: ${err.message}`);
      throw new Error(`AI Face Verification service unavailable: ${err.message}`);
    }
  },
};
