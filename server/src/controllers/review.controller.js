import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { auditService } from "../services/auditService.js";
import { sendSuccess, sendPaginated, sendError } from "../utils/responseEnvelope.js";

const reviewDecisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().min(3, "Notes are required (min 3 characters)"),
});

export const reviewController = {
  async getQueue(req, res, next) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      // Find documents where latest verification verdict is REVIEW and reviewDecisions is empty
      const allDocsWithVerifications = await prisma.document.findMany({
        where: {
          deletedAt: null,
          verifications: { some: { verdict: "REVIEW" } },
          reviewDecisions: { none: {} },
        },
        orderBy: { createdAt: "desc" },
        include: {
          submitter: { select: { id: true, name: true, email: true } },
          verifications: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      // Filter in JS to strictly ensure latest verification verdict is REVIEW
      const queueDocs = allDocsWithVerifications.filter(
        (doc) => doc.verifications.length > 0 && doc.verifications[0].verdict === "REVIEW"
      );

      const total = queueDocs.length;
      const paginatedDocs = queueDocs.slice(skip, skip + limitNum);

      return sendPaginated(res, paginatedDocs, total, pageNum, limitNum);
    } catch (err) {
      next(err);
    }
  },

  async submitDecision(req, res, next) {
    try {
      const { documentId } = req.params;

      const parsed = reviewDecisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, "Validation error", "VALIDATION_ERROR", 400, parsed.error.errors);
      }

      const { decision, notes } = parsed.data;

      const document = await prisma.document.findFirst({
        where: { id: documentId, deletedAt: null },
      });

      if (!document) {
        return sendError(res, "Document not found", "NOT_FOUND", 404);
      }

      const reviewRecord = await prisma.reviewDecision.create({
        data: {
          documentId,
          reviewerId: req.user.id,
          decision,
          notes,
        },
      });

      await auditService.log({
        actorId: req.user.id,
        action: `DOCUMENT_REVIEW_${decision}`,
        entityType: "Document",
        entityId: documentId,
        metadata: { decision, notes, reviewId: reviewRecord.id },
        ipAddress: req.ip,
      });

      return sendSuccess(res, reviewRecord, {}, 201);
    } catch (err) {
      next(err);
    }
  },

  async getMyReviews(req, res, next) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const where = {
        reviewerId: req.user.id,
      };

      const [total, reviews] = await prisma.$transaction([
        prisma.reviewDecision.count({ where }),
        prisma.reviewDecision.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            document: {
              include: {
                submitter: { select: { id: true, name: true, email: true } },
                verifications: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            },
          },
        }),
      ]);

      return sendPaginated(res, reviews, total, pageNum, limitNum);
    } catch (err) {
      next(err);
    }
  },
};
