import express from 'express';
import { validateRequest } from 'zod-express-middleware';
import { workspaceSchema } from '../libs/validate.schema.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { createWorkspace } from '../controllers/workspace.js'


const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateRequest({body: workspaceSchema}),
    createWorkspace
);

export default router;