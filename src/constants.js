const ALL_USERS = [
  { id: 'u1', name: '张三', avatarUrl: 'https://example.com/avatar1.png' },
  { id: 'u2', name: '李四', avatarUrl: 'https://example.com/avatar2.png' },
  { id: 'u3', name: '王五', avatarUrl: 'https://example.com/avatar3.png' },
];

const OKR_SETS = [
  {
    periodId: '2025-H2',
    periodName: '2025下半年',
    okrs: [
      {
        id: 'okr1',
        objective: '完成项目管理工具的开发',
        keyResults: [
          { id: 'kr1_1', description: '后端API开发完成' },
          { id: 'kr1_2', description: '前端与后端集成' },
        ],
      },
    ],
  },
];

const PROJECTS = [
  {
    name: '项目管理后端开发',
    priority: '部门OKR相关',
    businessProblem: '前端应用需要一个稳定、高性能的后端服务。',
    keyResultIds: ['kr1_1'],
    weeklyUpdate: '完成了用户和OKR模块的API。',
    lastWeekUpdate: '',
    status: '开发中',
    productManagers: [{ userId: 'u1', startDate: '2025-07-01', endDate: '2025-12-31', useSharedSchedule: false }],
    backendDevelopers: [{ userId: 'u2', startDate: '2025-07-01', endDate: '2025-12-31', useSharedSchedule: false }],
    frontendDevelopers: [],
    qaTesters: [],
    proposalDate: '2025-07-15',
    launchDate: '2025-09-01',
    followers: ['u3'],
    comments: [],
    changeLog: [],
  },
];

module.exports = {
  ALL_USERS,
  OKR_SETS,
  PROJECTS,
};