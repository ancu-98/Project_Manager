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

export { registerSchema, loginSchema};
