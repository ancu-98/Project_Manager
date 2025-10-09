import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(3, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    university: z.string().min(1, 'University is required').max(50, 'University cannot exceed 50 characters'),
    career: z.string().min(1, 'Career is required').max(50, 'Career cannot exceed 50 characters'),
    currentSemester: z.number().min(1, 'Semester is required').max(12),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1,'Password is required'),
})

const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Token is required')
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
});

const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const workspaceSchema = z.object({
    name: z.string().min(1,'Name is required'),
    description: z.string().optional(),
    color: z.string().min(1,'Color is required'),
});

const projectSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().optional(),
    status: z.enum([
        'Planning',
        'In Progress',
        'On Hold',
        'Completed',
        'Cancelled',
    ]),
    startDate: z.string(),
    dueDate: z.string().optional(),
    tags: z.string().optional(),
    members: z.array(
        z.object({
            user: z.string(),
            role: z.enum(['manager', 'contributor', 'viewer'])
        })
    ).optional(),
});

export {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resetPasswordSchema,
    emailSchema,
    workspaceSchema,
    projectSchema
};

