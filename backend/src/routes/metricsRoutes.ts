import { Router, Request, Response } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

const router = Router();

// Collect default process metrics once when the module is loaded.
let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  collectDefaultMetrics({ timeout: 5000 });
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    init();
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : String(err));
  }
});

export default router;
