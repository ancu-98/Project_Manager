import express from 'express'
import { validateRequest } from 'zod-express-middleware'
import authMiddleware from '../middleware/auth.middleware.js';
import { z } from 'zod';
import { activitySchema } from '../libs/validate.schema.js';
import { achievedActivity, addComment, addSubTask, createActivity, getActivityById, getCommentsByActivityId, getHistoryByResourceId, getMyActivities, updateActivityAssignees, updateActivityDescription, updateActivityPriority, updateActivityStatus, updateActivityTitle, updateSubTask, watchActivity } from '../controllers/activity.js';

const router = express.Router();

router.get('/my-activities', authMiddleware, getMyActivities);

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

router.get(
    '/:activityId',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
        }),
    }),
    getActivityById
)

router.put(
    '/:activityId/title',
    authMiddleware,
    validateRequest({
        params: z.object({activityId: z.string()}),
        body: z.object({title: z.string()})
    }),
    updateActivityTitle
)

router.put(
    '/:activityId/description',
    authMiddleware,
    validateRequest({
        params: z.object({activityId: z.string()}),
        body: z.object({description: z.string()})
    }),
    updateActivityDescription
)

router.put(
    '/:activityId/status',
    authMiddleware,
    validateRequest({
        params: z.object({activityId: z.string()}),
        body: z.object({status: z.string()})
    }),
    updateActivityStatus
)

router.put(
    '/:activityId/assignees',
    authMiddleware,
    validateRequest({
        params: z.object({activityId: z.string()}),
        body: z.object({assignees: z.array(z.string())})
    }),
    updateActivityAssignees
)

router.put(
    '/:activityId/priority',
    authMiddleware,
    validateRequest({
        params: z.object({activityId: z.string()}),
        body: z.object({priority: z.string()})
    }),
    updateActivityPriority
)

router.post(
    '/:activityId/add-subtask',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
        }),
        body: z.object({title: z.string()}),
    }),
    addSubTask
)

router.put(
    '/:activityId/update-subtask/:subTaskId',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
            subTaskId: z.string(),
        }),
        body: z.object({completed: z.boolean()}),
    }),
    updateSubTask
)

router.get(
    '/:resourceId/history',
    authMiddleware,
    validateRequest({
        params: z.object({
            resourceId: z.string(),
        }),
    }),
    getHistoryByResourceId
)

router.get(
    '/:activityId/comments',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
        }),
    }),
    getCommentsByActivityId
)

router.post(
    '/:activityId/add-comment',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
        }),
        body: z.object({text: z.string()}),
    }),
    addComment
)

router.post(
    '/:activityId/watch',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
        }),
    }),
    watchActivity
)

router.post(
    '/:activityId/achieved',
    authMiddleware,
    validateRequest({
        params: z.object({
            activityId: z.string(),
        }),
    }),
    achievedActivity
)

export default router;

