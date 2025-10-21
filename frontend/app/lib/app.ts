import type { ActivityStatus, ProjectStatus, TypeOfActivity } from "@/types/app";
import { Bookmark, BoxIcon, PictureInPicture, SquareCheckBig } from "lucide-react";

export const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/reset-password',
    '/forgot-password',
    '/',
];

export const getActivityTypeOfsymbols = (status: TypeOfActivity) => {
    switch(status) {
        case 'Epic':
            return {
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                symbol: BoxIcon,
                description: 'Epics track collections of related bugs, stories, and tasks.'
            }
        case 'Story':
            return {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                symbol: Bookmark,
                description: 'Stories track functionality or features expressed as user goals.'
            }
        case 'Task':
            return {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-bue-300',
                symbol: SquareCheckBig,
                description: 'Tasks track small, distinct pieces of work.'
            }
        case 'Subtask':
            return {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-bue-300',
                symbol: PictureInPicture ,
                description: 'Subtasks track small pieces of work that are part of a larger task.'
            }
    }
}

export const getActivityStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'In Progress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-bue-300';
        case 'Completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'Cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'On Hold':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'Planning':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
}

export const getProjectProgress = (activities: {status: ActivityStatus }[]) => {
    const totalActivities = activities.length;

    const completedActivities = activities.filter((activity) => activity?.status === 'Done').length;

    const progress =
        totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    return progress;
}