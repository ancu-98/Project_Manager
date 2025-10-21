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
        joinedAt: Date;
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
    sprints?: Sprint[];
    finishedSprints?: Sprint[];
    storyPointsToDo?: number;
    storyPointsInProgress?: number;
    storyPointsDone?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type sprintDuration = "1 week" | "2 weeks" | "3 weeks" | "4 weeks" | "customized";

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
    startedBy: User;
    isStarted: boolean;
    finishedBy: User;
    isFinished: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type ActivityStatus = 'To Do' | 'In Progress' | 'Done';
export type ActivityPriority = 'High' | 'Medium' | 'Low';
export enum ProjectMemberRole {
    MANAGER = 'manager',
    CONTRIBUTOR = 'contributor',
    VIEWER = 'viewer'
}

export enum TypeOfActivity {
    EPIC = 'Epic',
    STORY = 'Story',
    TASK = 'Task',
    SUBTASK = 'Subtask'
}

export interface Activity {
    _id: string;
    typeOf: TypeOfActivity;
    title: string;
    description?: string;
    relatedActivities?: Activity[];
    backlog: Backlog;
    isOnBacklog: boolean;
    status: ActivityStatus;
    priority: ActivityPriority;
    principal: Activity ;
    assignee: User;
    assignees: User[];
    watchers?: User | string;
    dueDate: Date;
    completedAt: Date;
    sprint?: Sprint ;
    isOnSprint: boolean;
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

export interface MembersProps {
    _id: string;
    user: User;
    role: 'admin' | 'member' | 'owner' | 'viewer';
    joinedAt: Date;
}


