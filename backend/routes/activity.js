import express from 'express'
import { validateRequest } from 'zod-express-middleware'
import authMiddleware from '../middleware/auth.middleware.js';
import { z } from 'zod';
import { activitySchema } from '../libs/validate.schema.js';
import { createActivity } from '../controllers/activity.js';

const router = express.Router();

router.post(
    '/:projectId/backlog/create-activity',
    authMiddleware,
    validateRequest({
        params: z.object({
            projectId: z.string(),
        }),
        body: activitySchema,
    }),
    createActivity
)

export default router;

