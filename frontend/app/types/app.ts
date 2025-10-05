export interface User {
    _id: string;
    email: string;
    name: string;
    university: string;
    career: string;
    currentSemester: string;
    createdAt: Date;
    isEmailVerified: boolean;
    updatedAt: Date;
    profilePicture: string
}

export interface Workspace {
    _id: string;
    name: string;
    description?: string;
    owner: User | string;
    color: string;
    members: {
        user: User;
        role: 'admin' | 'member' | 'owner' | 'viewer';
        joinetAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export enum ProjectStatus {
    PLANNING = 'Planning',
    IN_PROGRESS = 'In Progress',
    ON_HOLD = 'On Hold',
    COMPLETED = 'Completed',
    CANCELED = 'Cancelled',
}

export interface Project {
    _id: string;
    title: string;
    description?: string;
    workspace: Workspace;
    status: ProjectStatus;
    startDate: Date;
    dueDate: Date ;
    progress: number;
    backlog: Backlog;
    members: {
        user: User;
        role: 'admin' | 'member' | 'owner' | 'viewer';
        joinetAt: Date;
    }[];
    // tags: string;
    createdBy: User;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Backlog {
    _id: string;
    project: Project;
    activities?: Activity[];
    sprint?: Sprint[];
    storyPointsToDo?: number;
    storyPointsInProgress?: number;
    storyPointsDone?: number;
}

export type sprintDuration = ["1 week", "2 weeks", "3 weeks", "4 weeks", "customized"]

export interface Sprint {
    _id: string;
    backlog: Backlog;
    sprintName?: string;
    duration: sprintDuration;
    startDay: Date;
    finishDay: Date;
    sprintGoal?: string;
    storyPointsToDo?: number;
    storyPointsInProgress?: number;
    storyPointsDone?: number;
    activities?: Activity[];
    createdBy: User;
    isArchived: boolean;
}

export type ActivityStatus = 'To Do' | 'In Progress' | 'Done';
export type ActivityPriority = 'High' | 'Medium' | 'Low';

export enum TypeOfActivity {
    EPIC = 'Epic',
    HISTORY = 'History',
    TASK = 'Task',
    SUBTASKS = 'Subtasks'
}

export interface Activity {
    _id: string;
    typeOf: TypeOfActivity;
    title: string;
    description?: string;
    relatedActivities?: Activity[];
    backlog: Backlog;
    status: ActivityStatus;
    priority: ActivityPriority;
    principal: Activity ;
    assignee: User | string;
    assignees: User[];
    watchers?: User | string;
    dueDate: Date;
    completedAt: Date;
    sprint?: Sprint ;
    storyPointEstimate: number;
    estimatedHours: number ;
    actualHours: number ;
    // tags: ,
    subtasks?: SubTask[];
    comments?: Comment[] ;
    attachments?: Attachment[] ;
    createdBy: User | string ;
    isArchived: boolean ;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubTask {
    _id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

export interface Attachment {
    _id: string ;
    fileName: string ;
    fileUrl: string ;
    fileType: string;
    fileSize: number ;
    uploadedBy: User ;
    uploadedAt: Date ;
}

export interface Comment {
    _id: string ;
    text: string ;
    activity: Activity ;
    author: User ;
    mentions?: {
        user: User,
        offset: number,
        length: number ,
    }[],
    reactions?:{
        emoji: string,
        user: User
    }[],
    attachments?: Attachment[],
    isEdited: boolean,
}

