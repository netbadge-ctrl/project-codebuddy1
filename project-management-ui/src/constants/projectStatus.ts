// 项目状态定义
export const PROJECT_STATUSES = [
  '未开始',
  '需求讨论', 
  '需求完成',
  '待开发',
  '开发中',
  '待测试',
  '测试中',
  '测试完成待上线',
  '已上线'
] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number];

// 状态颜色映射
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  '未开始': 'bg-gray-100 text-gray-800',
  '需求讨论': 'bg-purple-100 text-purple-800',
  '需求完成': 'bg-blue-100 text-blue-800',
  '待开发': 'bg-yellow-100 text-yellow-800',
  '开发中': 'bg-orange-100 text-orange-800',
  '待测试': 'bg-cyan-100 text-cyan-800',
  '测试中': 'bg-indigo-100 text-indigo-800',
  '测试完成待上线': 'bg-emerald-100 text-emerald-800',
  '已上线': 'bg-green-100 text-green-800'
};

// 状态进度映射（用于进度条显示）
export const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  '未开始': 0,
  '需求讨论': 10,
  '需求完成': 20,
  '待开发': 30,
  '开发中': 50,
  '待测试': 70,
  '测试中': 80,
  '测试完成待上线': 90,
  '已上线': 100
};

// 状态分组（用于筛选）
export const STATUS_GROUPS = {
  '进行中': ['需求讨论', '需求完成', '待开发', '开发中', '待测试', '测试中', '测试完成待上线'],
  '已完成': ['已上线'],
  '未开始': ['未开始']
};