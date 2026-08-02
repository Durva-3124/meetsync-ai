import fs from 'node:fs';
import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Meeting } from '../models/Meeting.js';
import { ExportJob } from '../models/ExportJob.js';
import { ReviewVersion } from '../models/ReviewVersion.js';
import { getExportQueue } from '../queues/exportQueue.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';
import { validateQuery } from '../middleware/validate.js';

const router = Router({ mergeParams: true });

const exportQuerySchema = z.object({
  format: z.enum(['docx', 'pdf']),
});

// ── GET /api/meetings/:id/export?format=docx|pdf ──────────────────────────────

router.get(
  '/',
  requireAuth,
  validateQuery(exportQuerySchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params['id'] as string;
      const { format } = res.locals['parsedQuery'] as z.infer<
        typeof exportQuerySchema
      >;

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        res
          .status(404)
          .json({ code: 'MEETING_NOT_FOUND', message: 'Meeting not found' });
        return;
      }
      if (meeting.processingStatus !== 'completed') {
        res.status(409).json({
          code: 'PROCESSING_INCOMPLETE',
          message: 'Meeting processing not complete',
          processingStatus: meeting.processingStatus,
        });
        return;
      }

      if (req.user!.role === 'employee') {
        const uid = req.user!.sub;
        const allowed =
          meeting.createdBy.toString() === uid ||
          meeting.participants.some((p) => p.toString() === uid);
        if (!allowed) {
          res
            .status(403)
            .json({ code: 'ACCESS_DENIED', message: 'Access denied' });
          return;
        }
      }

      const latestReview = await ReviewVersion.findOne({ meetingId }).sort({
        version: -1,
      });
      const auditMarkers = latestReview
        ? latestReview.fields.map((f) => ({
            field: f.field,
            source: f.source,
            reviewVersion: latestReview.version,
            reviewedBy: latestReview.reviewedBy.toString(),
          }))
        : [];

      const exportJob = await ExportJob.create({
        meetingId,
        requestedBy: req.user!.sub,
        format,
        status: 'pending',
        auditMarkers,
      });

      await getExportQueue().add('generate', {
        jobId: exportJob.id,
        meetingId,
        format,
      });

      res.status(202).json({
        jobId: exportJob.id,
        status: exportJob.status,
        format,
        message: 'Export job enqueued',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/meetings/:id/export/:jobId ───────────────────────────────────────

router.get(
  '/:jobId',
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params['id'] as string;
      const jobId = req.params['jobId'] as string;

      const exportJob = await ExportJob.findById(jobId);
      if (!exportJob || exportJob.meetingId.toString() !== meetingId) {
        res.status(404).json({
          code: 'EXPORT_JOB_NOT_FOUND',
          message: 'Export job not found',
        });
        return;
      }

      if (
        req.user!.role === 'employee' &&
        exportJob.requestedBy.toString() !== req.user!.sub
      ) {
        res
          .status(403)
          .json({ code: 'ACCESS_DENIED', message: 'Access denied' });
        return;
      }

      if (exportJob.status === 'failed') {
        res.status(422).json({
          code: 'EXPORT_FAILED',
          message: exportJob.errorMessage ?? 'Export generation failed',
          jobId,
          status: exportJob.status,
        });
        return;
      }

      if (exportJob.status !== 'done') {
        res.json({ jobId, status: exportJob.status });
        return;
      }

      const filePath = exportJob.filePath!;
      if (!fs.existsSync(filePath)) {
        res.status(410).json({
          code: 'FILE_EXPIRED',
          message: 'Export file no longer available',
        });
        return;
      }

      const mimeType =
        exportJob.format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="meeting-${meetingId}.${exportJob.format}"`
      );
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
