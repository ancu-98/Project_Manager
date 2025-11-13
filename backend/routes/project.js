import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js';
import { projectSchema, updateProjectSchema } from '../libs/validate.schema.js';
import { returnSprintActivitytoProjectBacklog, createProject, getProjectBacklogActivities, getProjectBacklogDetails, updateProject, deleteProject } from '../controllers/project.js';
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

router.get(
    '/:projectId/backlog',
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    getProjectBacklogDetails
);

router.put(
    '/:projectId/backlog/update-project',
    authMiddleware,
    validateRequest({
        params: z.object({projectId: z.string()}),
        body: updateProjectSchema
    }),
    updateProject
)

router.get(
    '/:projectId/backlog/activities',
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    getProjectBacklogActivities
);

router.post(
  '/:projectId/backlog/return-activity/:activityId',
  authMiddleware,
  validateRequest({
    params: z.object({
      projectId: z.string(),
      activityId: z.string()
    }),
  }),
  returnSprintActivitytoProjectBacklog
)

router.delete(
  '/:projectId/backlog/delete-project',
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  deleteProject
);


export default router;