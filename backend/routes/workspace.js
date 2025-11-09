import express from 'express';
import { validateRequest } from 'zod-express-middleware';
import { inviteMemberSchema, rejectJoinRequestTokenSchema, tokenSchema, workspaceSchema } from '../libs/validate.schema.js';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  acceptJoinRequestByToken,
  createWorkspace,
  getAllWorkspaces,
  getPendingJoinRequest,
  getPendingJoinRequests,
  getPublicWorkspaceDetails,
  getPublicWorkspaceProjects,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  joinRequestToWorkspace,
  rejectJoinRequestByToken
} from '../controllers/workspace.js'
import { z } from 'zod';

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateRequest({body: workspaceSchema}),
    createWorkspace
);

router.get('/', authMiddleware, getWorkspaces);

//Aceptar invitacion por token
router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

// Invitar usuario a workspace
router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

//Aceptar invitacion por link generado
router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

//Solicitar unirse desde publicWorkspace
router.post(
  "/explore-workspaces/public/:workspaceId/join-request",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
  }),
  joinRequestToWorkspace
)

// Obtener solicitudes pendientes
router.get('/:workspaceId/join-requests', authMiddleware, getPendingJoinRequests);

//Obtener solicitud pendiente
router.get('/:workspaceId/join-request', authMiddleware, getPendingJoinRequest);

// Aceptar solicitud
router.post(
  "/accept-join-request-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptJoinRequestByToken
);
// router.post('/join-requests/:requestId/accept', authMiddleware, acceptJoinRequestByToken);

// Rechazar solicitud
router.post(
  "/reject-join-request-token",
  authMiddleware,
  validateRequest({ body: rejectJoinRequestTokenSchema }),
  rejectJoinRequestByToken
);
// router.post('/join-requests/:requestId/reject', authMiddleware, rejectJoinRequest);

router.get('/explore-workspaces', authMiddleware, getAllWorkspaces);
router.get('/explore-workspaces/public/:workspaceId', authMiddleware, getPublicWorkspaceDetails);
router.get('/explore-workspaces/public/:workspaceId/projects', authMiddleware, getPublicWorkspaceProjects);

router.get('/:workspaceId', authMiddleware, getWorkspaceDetails);
router.get('/:workspaceId/projects', authMiddleware, getWorkspaceProjects);


router.get('/:workspaceId/stats', authMiddleware, getWorkspaceStats);


export default router;