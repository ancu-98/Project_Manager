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
    projects?: Project[] ;
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
    tags: string[];
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
    watchers?: User[];
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

export interface MembersProps {
    _id: string;
    user: User;
    role: 'admin' | 'member' | 'owner' | 'viewer';
    joinedAt: Date;
}

export type ResourceType =
    | 'Activity'
    | 'Sprint'
    | 'Project'
    | 'Workspace'
    | 'Comment'
    | 'User';

export type ActionType =
    | "created-sprint"
    | "updated-sprint"
    | "started-sprint"
    | "finished-sprint"
    | "created_activity"
    | "updated_activity"
    | "created_subtask"
    | "updated_subtask"
    | "completed_activity"
    | "created_project"
    | "updated_project"
    | "completed_project"
    | "created_workspace"
    | "updated_workspace"
    | "added_comment"
    | "added_member"
    | "removed_member"
    | "joined_workspace"
    | "rejected_join_request"
    | "transferred_workspace_ownership"
    | "added_attachment"

export interface HistoryLog {
    _id: string;
    user: User;
    action: ActionType ;
    resourceType: ResourceType ;
    resourceId: string;
    details: any;
    createdBy: Date;
}

export interface CommentReaction {
    emoji: string;
    user: User;
}


export interface Comment {
    _id: string;
    author: User;
    text: string;
    createdAt: Date;
    reactions?: CommentReaction[];
    attachments?: {
        fileName: string;
        fileUrl: string;
        fileType?: string;
        fileSize?: number;
    }[];
}

export interface StatsCardProps {
    totalProjects: number,
    totalActivities: number,
    totalProjectsInProgress: number,
    totalActivitiesToDo: number,
    totalActivitiesInProgress: number,
    totalActivitiesCompleted: number,
}

export interface ActivityTrendData {
    name: string;
    completed: string;
    inProgress: number;
    toDo: number;
}

export interface ActivityPriorityData {
    name: string;
    value: number;
    color: string;
}

export interface ProjectStatusData {
    name: string;
    value: number;
    color: string;
}

export interface WorkspaceProductivityData {
    name: string;
    completed: number;
    total: number;
}

export interface WorkspaceJoinRequest {
  _id: string;
  user: User;
  workspaceId: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}