import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { storageService } from "../services/storageService.js";
import { computeFileSha256 } from "../utils/hash.js";
import { aiService } from "../services/aiService.js";
import { scoringService } from "../services/scoringService.js";
import { auditService } from "../services/auditService.js";
import { emitDocumentStatus } from "../sockets/index.js";
import { sendSuccess, sendPaginated, sendError } from "../utils/responseEnvelope.js";

const docTypeEnum = z.enum(["PASSPORT", "VISA", "NATIONAL_ID", "DRIVING_LICENSE", "PERMIT"]);

export const documentController = {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, "Document file is required", "BAD_REQUEST", 400);
      }

      const docTypeParsed = docTypeEnum.safeParse(req.body.docType);
      if (!docTypeParsed.success) {
        return sendError(res, "Invalid document type", "BAD_REQUEST", 400);
      }

      const docType = docTypeParsed.data;

      // Save file securely using storage service abstraction
      const savedStorage = await storageService.save(req.file.buffer, req.file.originalname);
      const fileHash = await computeFileSha256(savedStorage.filePath);

      // Create Document record with PENDING status
      const document = await prisma.document.create({
        data: {
          submitterId: req.user.id,
          docType,
          filePath: savedStorage.storageKey,
          fileHash,
          originalFilename: req.file.originalname,
          mimeType: savedStorage.mimeType,
          sizeBytes: savedStorage.sizeBytes,
          status: "PENDING",
        },
      });

      emitDocumentStatus(document.id, "received", { step: "Document received and queued for processing" });

      await auditService.log({
        actorId: req.user.id,
        action: "DOCUMENT_UPLOADED",
        entityType: "Document",
        entityId: document.id,
        metadata: { docType, fileHash, originalFilename: req.file.originalname },
        ipAddress: req.ip,
      });

      // Execute AI Verification Workflow
      (async () => {
        try {
          emitDocumentStatus(document.id, "processing", { step: "Running AI layers (OCR, Validation, Tampering, Face)" });
          
          await prisma.document.update({
            where: { id: document.id },
            data: { status: "PROCESSING" },
          });

          const aiResponse = await aiService.verify({
            filePath: savedStorage.filePath,
            docType,
          });

          const scoreEvaluated = scoringService.calculateScore(aiResponse);

          const verification = await prisma.verification.create({
            data: {
              documentId: document.id,
              extractedName: aiResponse.extracted?.name || null,
              extractedDocNumber: aiResponse.extracted?.docNumber || null,
              extractedDob: aiResponse.extracted?.dob || null,
              extractedNationality: aiResponse.extracted?.nationality || null,
              extractedExpiry: aiResponse.extracted?.expiry || null,
              extractedGender: aiResponse.extracted?.gender || null,
              layers: aiResponse.layers || {},
              overallScore: scoreEvaluated.overallScore,
              verdict: scoreEvaluated.verdict,
              engineVersion: aiResponse.engineVersion || "stub-1.0",
            },
          });

          await prisma.document.update({
            where: { id: document.id },
            data: { status: "VERIFIED" },
          });

          emitDocumentStatus(document.id, "done", {
            verdict: scoreEvaluated.verdict,
            overallScore: scoreEvaluated.overallScore,
            verificationId: verification.id,
          });

          await auditService.log({
            actorId: req.user.id,
            action: "DOCUMENT_VERIFIED",
            entityType: "Document",
            entityId: document.id,
            metadata: { verdict: scoreEvaluated.verdict, score: scoreEvaluated.overallScore },
          });
        } catch (procErr) {
          await prisma.document.update({
            where: { id: document.id },
            data: { status: "FAILED" },
          });

          emitDocumentStatus(document.id, "failed", { error: procErr.message });

          await auditService.log({
            actorId: req.user.id,
            action: "DOCUMENT_VERIFICATION_FAILED",
            entityType: "Document",
            entityId: document.id,
            metadata: { error: procErr.message },
          });
        }
      })();

      // Return Document + latest state
      const refreshedDoc = await prisma.document.findUnique({
        where: { id: document.id },
        include: { verifications: { orderBy: { createdAt: "desc" }, take: 1 } },
      });

      return sendSuccess(res, refreshedDoc, {}, 201);
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const { verdict, docType, status, dateFrom, dateTo, page = 1, pageSize = 10 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const where = {
        deletedAt: null,
      };

      // Ownership restriction
      if (req.user.role === "SUBMITTER") {
        where.submitterId = req.user.id;
      }

      if (docType) where.docType = docType;
      if (status) where.status = status;

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      if (verdict) {
        where.verifications = {
          some: {
            verdict: verdict,
          },
        };
      }

      const [total, documents] = await prisma.$transaction([
        prisma.document.count({ where }),
        prisma.document.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            submitter: { select: { id: true, name: true, email: true } },
            verifications: { orderBy: { createdAt: "desc" }, take: 1 },
            reviewDecisions: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        }),
      ]);

      return sendPaginated(res, documents, total, pageNum, limitNum);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const document = await prisma.document.findFirst({
        where: { id, deletedAt: null },
        include: {
          submitter: { select: { id: true, name: true, email: true } },
          verifications: { orderBy: { createdAt: "desc" } },
          reviewDecisions: {
            orderBy: { createdAt: "desc" },
            include: { reviewer: { select: { id: true, name: true, email: true } } },
          },
        },
      });

      if (!document) {
        return sendError(res, "Document not found", "NOT_FOUND", 404);
      }

      // Check ownership if submitter
      if (req.user.role === "SUBMITTER" && document.submitterId !== req.user.id) {
        return sendError(res, "Access denied to this document", "FORBIDDEN", 403);
      }

      return sendSuccess(res, document);
    } catch (err) {
      next(err);
    }
  },

  async reverify(req, res, next) {
    try {
      const { id } = req.params;

      const document = await prisma.document.findFirst({
        where: { id, deletedAt: null },
      });

      if (!document) {
        return sendError(res, "Document not found", "NOT_FOUND", 404);
      }

      emitDocumentStatus(document.id, "processing", { step: "Admin triggered re-verification" });

      await prisma.document.update({
        where: { id: document.id },
        data: { status: "PROCESSING" },
      });

      const fullFilePath = storageService.get
        ? await storageService.save // fallback check
          ? `${process.cwd()}/uploads/${document.filePath}`
          : document.filePath
        : document.filePath;

      const aiResponse = await aiService.verify({
        filePath: fullFilePath,
        docType: document.docType,
      });

      const scoreEvaluated = scoringService.calculateScore(aiResponse);

      const verification = await prisma.verification.create({
        data: {
          documentId: document.id,
          extractedName: aiResponse.extracted?.name || null,
          extractedDocNumber: aiResponse.extracted?.docNumber || null,
          extractedDob: aiResponse.extracted?.dob || null,
          extractedNationality: aiResponse.extracted?.nationality || null,
          extractedExpiry: aiResponse.extracted?.expiry || null,
          extractedGender: aiResponse.extracted?.gender || null,
          layers: aiResponse.layers || {},
          overallScore: scoreEvaluated.overallScore,
          verdict: scoreEvaluated.verdict,
          engineVersion: aiResponse.engineVersion || "stub-1.0",
        },
      });

      await prisma.document.update({
        where: { id: document.id },
        data: { status: "VERIFIED" },
      });

      emitDocumentStatus(document.id, "done", {
        verdict: scoreEvaluated.verdict,
        overallScore: scoreEvaluated.overallScore,
        verificationId: verification.id,
      });

      await auditService.log({
        actorId: req.user.id,
        action: "DOCUMENT_REVERIFIED",
        entityType: "Document",
        entityId: document.id,
        metadata: { verdict: scoreEvaluated.verdict, score: scoreEvaluated.overallScore },
      });

      const updatedDoc = await prisma.document.findUnique({
        where: { id: document.id },
        include: {
          verifications: { orderBy: { createdAt: "desc" } },
          reviewDecisions: true,
        },
      });

      return sendSuccess(res, updatedDoc);
    } catch (err) {
      next(err);
    }
  },
};
