import express from 'express';
import {z} from 'zod'
import { validateRequest } from 'zod-express-middleware';
import { loginSchema, registerSchema } from '../libs/validate.schema.js';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post(
    '/register',
    //? Authentication middleware
    validateRequest({
        body: registerSchema
    }),
    registerUser
);

router.post(
    '/login',
    //? Authentication middleware
    validateRequest({
        body: loginSchema,
    }),
    loginUser
);

export default router;