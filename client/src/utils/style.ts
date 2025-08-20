import { ProjectStatus, ProjectPriority } from '../types';

export const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case '已上线':
      return 'bg-green-100 text-green-800';
    case '开发中':
    case '测试中':
      return 'bg-blue-100 text-blue-800';
    case '待开发':
    case '待测试':
      return 'bg-yellow-100 text-yellow-800';
    case '需求讨论':
    case '需求完成':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case '部门OKR相关':
      return 'bg-red-100 text-red-800';
    case '个人OKR相关':
      return 'bg-orange-100 text-orange-800';
    case '临时重要需求':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const projectColors = [
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444',
  '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'
];

export const getProjectColor = (projectId: string) => {
  // Simple hash function to get a consistent color
  let hash = 0;
  if (projectId.length === 0) return projectColors[0];
  for (let i = 0; i < projectId.length; i++) {
    const char = projectId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash % projectColors.length);
  return projectColors[index];
};
