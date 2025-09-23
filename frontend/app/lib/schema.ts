import { z } from 'zod';

export const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password required'),
});

export const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be 8 characters'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    university: z.string().min(1, 'University is required').max(50, 'University cannot exceed 50 characters'),
    career: z.string().min(1, 'Career is required').max(50, 'Career cannot exceed 50 characters'),
    currentSemester: z.number().min(1, 'Semester is required').max(12),
}).refine((data) => data.password === data.confirmPassword,{
    path: ['confirmPassword'],
    message:'Password do not match',
});

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, 'Password must be 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be 8 characters')
}).refine((data) => data.newPassword === data.confirmPassword,{
    path: ['confirmPassword'],
    message:'Password do not match',
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});