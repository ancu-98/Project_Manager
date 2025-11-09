import { ProjectStatus } from '@/types/app';
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

export const workspaceSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    color: z.string().min(3, 'Color must be at least 3 characters'),
    description: z.string().optional() ,
})

export const projectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional() ,
    status: z.nativeEnum(ProjectStatus),
    startDate: z.string().min(10, 'Start date is required') ,
    dueDate: z.string().min(10, 'Due date is required'),
    tags: z.string().optional(),
    members: z.array(
        z.object({
            user: z.string(),
            role: z.enum(['manager', 'contributor', 'viewer'])
        })
    ).optional(),
});

export const createActivitySchema = z.object({
    typeOf: z.enum(['Epic', 'Story', 'Task', 'Subtask']),
    title: z.string().min(1, 'Activity title is required'),
    description: z.string().optional(),
    status: z.enum(['To Do', 'In Progress', 'Done']),
    priority: z.enum(['Low', 'Medium', 'High']),
    dueDate: z.string().min(1, 'Due date is required'),
    assignees: z.array(z.string()).min(1,'At least one assignee is requires'),
});

export const updateStartSprintSchema = z.object({
    sprintName: z.string().min(1, 'Sprint name is required'),
    duration: z.enum(["1 week", "2 weeks", "3 weeks", "4 weeks", "customized"]),
    startDay: z.string().min(1, 'Start date is required'),
    finishDay: z.string().min(1, 'Start date is required'),
    sprintGoal: z.string().optional(),
})

export const inviteMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member", "viewer"]),
});

export const rejectJoinRequestSchema = z.object({
    reason: z.string().min(1, 'Reazon join reject is required')
})