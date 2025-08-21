// 用户类型
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

// 项目状态枚举
export type ProjectStatus = 
  | '未开始' 
  | '需求讨论' 
  | '需求完成' 
  | '待开发' 
  | '开发中' 
  | '待测试' 
  | '测试中' 
  | '测试完成待上线' 
  | '已上线';

// 项目优先级枚举
export type ProjectPriority = 
  | '部门OKR相关' 
  | '个人OKR相关' 
  | '临时重要需求' 
  | '日常需求';

// 角色类型
export interface Role {
  userId: string;
  startDate: string;
  endDate: string;
  useSharedSchedule: boolean;
}

// 评论类型
export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  mentions: string[];
}

// 变更记录类型
export interface ChangeLogEntry {
  id: string;
  userId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedAt: string;
}

// 项目类型
export interface Project {
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
  createdAt?: string;
  updatedAt?: string;
}

// 关键结果类型
export interface KeyResult {
  id: string;
  description: string;
}

// OKR类型
export interface OKR {
  id: string;
  objective: string;
  keyResults: KeyResult[];
}

// OKR集合类型
export interface OKRSet {
  periodId: string;
  periodName: string;
  okrs: OKR[];
}

// 筛选条件类型
export interface FilterState {
  search: string;
  statuses: ProjectStatus[];
  priorities: ProjectPriority[];
  users: string[];
  okrs: string[];
}

// 视图类型
export type ViewType = 'personal' | 'overview' | 'okr' | 'kanban' | 'weekly';

// 看板时间粒度
export type TimeGranularity = 'week' | 'month';

// 主题类型
export type Theme = 'light' | 'dark';

// API响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}