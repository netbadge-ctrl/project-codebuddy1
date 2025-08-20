export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Role = {
  userId: string;
  startDate: string;
  endDate: string;
  useSharedSchedule: boolean;
};

export type KeyResult = {
  id: string;
  description: string;
};

export type Okr = {
  id: string;
  objective: string;
  keyResults: KeyResult[];
};

export type OkrSet = {
  periodId: string;
  periodName: string;
  okrs: Okr[];
};

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  mentions: string[];
};

export type ChangeLogEntry = {
  id: string;
  userId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedAt: string;
};

export const ProjectStatuses = [
  '未开始',
  '需求讨论',
  '需求完成',
  '待开发',
  '开发中',
  '待测试',
  '测试中',
  '测试完成待上线',
  '已上线',
] as const;
export type ProjectStatus = (typeof ProjectStatuses)[number];

export const ProjectPriorities = ['部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求'] as const;
export type ProjectPriority = (typeof ProjectPriorities)[number];

export type Project = {
  id: string;
  name: string;
  priority: ProjectPriority;
  businessProblem?: string;
  keyResultIds: string[];
  weeklyUpdate?: string;
  lastWeekUpdate?: string;
  status: ProjectStatus;
  productManagers: Role[];
  backendDevelopers: Role[];
  frontendDevelopers: Role[];
  qaTesters: Role[];
  proposalDate?: string;
  launchDate?: string;
  followers: string[];
  comments: Comment[];
  changeLog: ChangeLogEntry[];
};