import express from "express";

import authRoutes from "./auth.js";
import workspaceRoutes from './workspace.js'
import projectRoutes from './project.js'
import sprintRoutes from './sprint.js'
import activityRoutes from './activity.js'


const router = express.Router();

router.use("/auth", authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/sprints', sprintRoutes)
router.use('/activities', activityRoutes);

export default router;


/* PROJECT ROUTES

AUTH
router.use("/auth", authRoutes);

------------
|WORKSPACES|
------------
router.use('/workspaces', workspaceRoutes);
router.get('/', authMiddleware, getWorkspaces);
router.get('/:workspaceId', authMiddleware, getWorkspaceDetails);
router.get('/:workspaceId/projects', authMiddleware, getWorkspaceProjects);

------------
|PROJECTS|
------------
router.use('/projects', projectRoutes);
router.post( '/:workspaceId/create-project', authMiddleware,
    validateRequest({
        params: z.object({
            workspaceId: z.string()
        }),
        body: projectSchema,
    }),
    createProject
);

router.get( '/:projectId', authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    getProjectDetails
);x

BACKLOGS
router.use('/backlogs', backlogRoutes);
router.get('/', authMiddleware, getWorkspaces);
router.get('/:workspaceId', authMiddleware, getWorkspaceDetails);
router.get('/:workspaceId/projects', authMiddleware, getWorkspaceProjects);




ACTIVITIES
router.use('/activities', activityRoutes);

*/