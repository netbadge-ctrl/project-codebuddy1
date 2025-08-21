// 初始用户数据
const ALL_USERS = [
  { id: 'u1', name: '张三', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1' },
  { id: 'u2', name: '李四', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2' },
  { id: 'u3', name: '王五', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3' },
  { id: 'u4', name: '赵六', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u4' },
  { id: 'u5', name: '钱七', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u5' },
  { id: 'u6', name: '孙八', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u6' }
];

// 初始OKR数据
const OKR_SETS = [
  {
    periodId: '2025-H1',
    periodName: '2025上半年',
    okrs: [
      {
        id: 'okr1',
        objective: '提升产品用户体验',
        keyResults: [
          { id: 'kr1_1', description: '用户满意度提升至90%以上' },
          { id: 'kr1_2', description: '页面加载速度优化50%' }
        ]
      },
      {
        id: 'okr2',
        objective: '扩大市场份额',
        keyResults: [
          { id: 'kr2_1', description: '新增用户数量达到10万' },
          { id: 'kr2_2', description: '市场占有率提升至15%' }
        ]
      }
    ]
  },
  {
    periodId: '2025-H2',
    periodName: '2025下半年',
    okrs: [
      {
        id: 'okr3',
        objective: '技术架构升级',
        keyResults: [
          { id: 'kr3_1', description: '完成微服务架构改造' },
          { id: 'kr3_2', description: '系统可用性达到99.9%' }
        ]
      }
    ]
  }
];

// 初始项目数据
const PROJECTS = [
  {
    name: '用户体验优化项目',
    priority: '部门OKR相关',
    businessProblem: '当前用户反馈页面加载速度慢，影响用户体验',
    keyResultIds: ['kr1_1', 'kr1_2'],
    status: '开发中',
    productManagers: [
      { userId: 'u1', startDate: '2025-01-01', endDate: '2025-06-30', useSharedSchedule: false }
    ],
    backendDevelopers: [
      { userId: 'u2', startDate: '2025-01-15', endDate: '2025-05-30', useSharedSchedule: true }
    ],
    frontendDevelopers: [
      { userId: 'u3', startDate: '2025-01-15', endDate: '2025-05-30', useSharedSchedule: true }
    ],
    qaTesters: [
      { userId: 'u4', startDate: '2025-04-01', endDate: '2025-06-15', useSharedSchedule: false }
    ],
    proposalDate: '2025-01-01',
    launchDate: '2025-06-30',
    followers: ['u5', 'u6'],
    weeklyUpdate: '<p>本周完成了前端页面优化，<strong>性能提升明显</strong></p>',
    lastWeekUpdate: '<p>上周完成了需求分析和技术方案设计</p>'
  },
  {
    name: '移动端适配项目',
    priority: '个人OKR相关',
    businessProblem: '移动端用户体验不佳，需要进行适配优化',
    keyResultIds: [],
    status: '需求讨论',
    productManagers: [
      { userId: 'u2', startDate: '2025-02-01', endDate: '2025-07-31', useSharedSchedule: false }
    ],
    frontendDevelopers: [
      { userId: 'u3', startDate: '2025-02-15', endDate: '2025-07-15', useSharedSchedule: true }
    ],
    proposalDate: '2025-02-01',
    launchDate: '2025-07-31',
    followers: ['u1'],
    weeklyUpdate: '<p>本周进行了移动端用户调研</p>'
  }
];

module.exports = {
  ALL_USERS,
  OKR_SETS,
  PROJECTS
};