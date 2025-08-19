// A global user pool
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

// A team member is a user with a specific schedule for a project
export interface TeamMember {
  userId: string;
  startDate: string;
  endDate: string;
  useSharedSchedule?: boolean;
}

// Each role is an array of team members
export type Role = TeamMember[];

export enum ProjectStatus {
  NotStarted = '未开始',
  Discussion = '需求讨论',
  RequirementsDone = '需求完成',
  ReviewDone = '评审完成待开发',
  InProgress = '开发中',
  DevDone = '开发完成待测试',
  Testing = '测试中',
  TestDone = '测试完成待上线',
  Launched = '已上线',
}

export enum Priority {
    P0 = 'P0',
    P1 = 'P1',
    P2 = 'P2',
    P3 = 'P3',
}

export interface KeyResult {
  id: string;
  description: string;
}

export interface OKR {
  id:string;
  objective: string;
  keyResults: KeyResult[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  mentions?: string[];
}

export interface ChangeLogEntry {
  id: string;
  userId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  businessProblem: string;
  keyResultIds: string[];
  weeklyUpdate: string;
  lastWeekUpdate: string;
  status: ProjectStatus;
  productManagers: Role;
  backendDevelopers: Role;
  frontendDevelopers: Role;
  qaTesters: Role;
  proposalDate: string;
  launchDate: string;
  followers: string[];
  comments: Comment[];
  changeLog: ChangeLogEntry[];
  isNew?: boolean;
}

export type ProjectRoleKey = keyof Pick<Project, 'productManagers' | 'backendDevelopers' | 'frontendDevelopers' | 'qaTesters'>;