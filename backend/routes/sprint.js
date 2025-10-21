import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateRequest } from "zod-express-middleware";
import {
  achievedSprint,
  addBacklogActivityToSprint,
  createSprint,
  finishStartedSprint,
  updateStartSprint,
} from "../controllers/sprint.js";
import { z } from "zod";
import { updateStartSprintSchema } from "../libs/validate.schema.js";

const router = express.Router();

router.post(
  "/:projectId/backlog/create-sprint",
  authMiddleware,
  validateRequest({
    params: z.object({
      projectId: z.string(),
    }),
  }),
  createSprint
);

router.put(
  "/:sprintId",
  authMiddleware,
  validateRequest({
    params: z.object({
      sprintId: z.string(),
    }),
    body: updateStartSprintSchema,
  }),
  updateStartSprint
);

router.post(
  "/:sprintId/add-activity/:activityId",
  authMiddleware,
  validateRequest({
    params: z.object({
      sprintId: z.string(),
      activityId: z.string(),
    }),
  }),
  addBacklogActivityToSprint
);

router.post(
  "/:sprintId/achieved",
  authMiddleware,
  validateRequest({
    params: z.object({
      sprintId: z.string(),
    }),
  }),
  achievedSprint
);

router.post(
  "/:sprintId/finished",
  authMiddleware,
  validateRequest({
    params: z.object({
      sprintId: z.string(),
    }),
  }),
  finishStartedSprint
);

export default router;
