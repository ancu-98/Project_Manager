import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js';
import { projectSchema } from '../libs/validate.schema.js';
import { createProject } from '../controllers/project.js';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.post(
    '/:workspaceId/create-project',
    authMiddleware,
    validateRequest({
        params: z.object({
            workspaceId: z.string()
        }),
        body: projectSchema,
    }),
    createProject
);

export default router;