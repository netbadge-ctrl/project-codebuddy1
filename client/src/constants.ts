import { ProjectStatus, ProjectPriority } from './types';

// 项目状态选项
export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  '未开始',
  '需求讨论',
  '需求完成',
  '待开发',
  '开发中',
  '待测试',
  '测试中',
  '测试完成待上线',
  '已上线'
];

// 项目优先级选项
export const PROJECT_PRIORITY_OPTIONS: ProjectPriority[] = [
  '部门OKR相关',
  '个人OKR相关',
  '临时重要需求',
  '日常需求'
];

// 状态颜色映射
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  '未开始': 'bg-gray-100 text-gray-800',
  '需求讨论': 'bg-yellow-100 text-yellow-800',
  '需求完成': 'bg-blue-100 text-blue-800',
  '待开发': 'bg-purple-100 text-purple-800',
  '开发中': 'bg-indigo-100 text-indigo-800',
  '待测试': 'bg-orange-100 text-orange-800',
  '测试中': 'bg-pink-100 text-pink-800',
  '测试完成待上线': 'bg-green-100 text-green-800',
  '已上线': 'bg-emerald-100 text-emerald-800'
};

// 优先级颜色映射
export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  '部门OKR相关': 'bg-red-100 text-red-800',
  '个人OKR相关': 'bg-orange-100 text-orange-800',
  '临时重要需求': 'bg-yellow-100 text-yellow-800',
  '日常需求': 'bg-gray-100 text-gray-800'
};

// 角色类型
export const ROLE_TYPES = {
  productManagers: '产品经理',
  backendDevelopers: '后端开发',
  frontendDevelopers: '前端开发',
  qaTesters: '测试人员'
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  USER: 'project_management_user',
  THEME: 'project_management_theme',
  FILTERS: 'project_management_filters'
} as const;

// 日期格式
export const DATE_FORMAT = 'YYYY-MM-DD';

// 富文本编辑器工具栏配置
export const RICH_TEXT_TOOLBAR = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  '|',
  'fontColor',
  'backgroundColor',
  '|',
  'bulletList',
  'orderedList',
  '|',
  'link',
  'unlink'
];

// 默认筛选状态
export const DEFAULT_FILTER_STATE = {
  search: '',
  statuses: [] as ProjectStatus[],
  priorities: [] as ProjectPriority[],
  users: [] as string[],
  okrs: [] as string[]
};

// 看板视图配置
export const KANBAN_CONFIG = {
  WEEKS_TO_SHOW: 12,
  MONTHS_TO_SHOW: 6,
  USER_HEIGHT: 60,
  PROJECT_HEIGHT: 40
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};