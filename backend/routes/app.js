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