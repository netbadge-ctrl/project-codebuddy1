import { Project, User, ProjectStatus, OKR, Priority } from './types';

export const ALL_USERS: User[] = [
  { id: 'u1', name: '张三', avatarUrl: 'https://picsum.photos/seed/u1/40/40' },
  { id: 'u2', name: '李四', avatarUrl: 'https://picsum.photos/seed/u2/40/40' },
  { id: 'u3', name: '王五', avatarUrl: 'https://picsum.photos/seed/u3/40/40' },
  { id: 'u4', name: '赵六', avatarUrl: 'https://picsum.photos/seed/u4/40/40' },
  { id: 'u5', name: '孙七', avatarUrl: 'https://picsum.photos/seed/u5/40/40' },
  { id: 'u6', name: '周八', avatarUrl: 'https://picsum.photos/seed/u6/40/40' },
  { id: 'u7', name: '吴九', avatarUrl: 'https://picsum.photos/seed/u7/40/40' },
  { id: 'u8', name: '郑十', avatarUrl: 'https://picsum.photos/seed/u8/40/40' },
  { id: 'u9', name: '陈十一', avatarUrl: 'https://picsum.photos/seed/u9/40/40' },
  { id: 'u10', name: '卫十二', avatarUrl: 'https://picsum.photos/seed/u10/40/40' },
];

export const OKRS: OKR[] = [
  {
    id: 'okr1',
    objective: '实现季度新用户增长30%，提升应用商店排名至前十。',
    keyResults: [
      { id: 'kr1_1', description: '完成3次线上市场推广活动' },
      { id: 'kr1_2', description: '应用商店评分提升至4.8分' },
    ],
  },
  {
    id: 'okr2',
    objective: '将支付成功率提升至99.5%，减少支付流程平均时长50%。',
    keyResults: [
      { id: 'kr2_1', description: '重构支付网关，减少技术故障率90%' },
      { id: 'kr2_2', description: '优化前端支付交互，减少用户操作步骤' },
    ],
  },
  {
    id: 'okr3',
    objective: '新版后台上线，提升运营人员日均操作效率40%。',
    keyResults: [
      { id: 'kr3_1', description: '收集运营团队反馈，完成10项核心功能优化' },
      { id: 'kr3_2', description: '新后台系统Bug率低于0.1%' },
    ],
  },
];

const today = new Date();
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const formatDate = (date: Date): string => date.toISOString().split('T')[0];


export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Q3 用户增长计划',
    priority: Priority.P0,
    businessProblem: '新用户注册率增长放缓，需要提升品牌曝光度和转化率。',
    keyResultIds: ['kr1_1', 'kr1_2'],
    weeklyUpdate: '市场活动已启动，网红合作细节敲定中。',
    lastWeekUpdate: '<div>确定了市场推广的核心主题和预算。</div>',
    status: ProjectStatus.InProgress,
    productManagers: [
      { userId: 'u1', startDate: formatDate(addDays(today, -45)), endDate: formatDate(addDays(today, 30)) },
    ],
    backendDevelopers: [
      { userId: 'u4', startDate: formatDate(addDays(today, -30)), endDate: formatDate(addDays(today, 15)) },
    ],
    frontendDevelopers: [
      { userId: 'u5', startDate: formatDate(addDays(today, -30)), endDate: formatDate(addDays(today, 20)) },
    ],
    qaTesters: [
      { userId: 'u9', startDate: formatDate(today), endDate: formatDate(addDays(today, 30)) },
    ],
    proposalDate: formatDate(addDays(today, -60)),
    launchDate: formatDate(addDays(today, 30)),
    followers: ['u2', 'u3'],
    comments: [
      { id: 'c1-1', userId: 'u2', text: '这个项目很重要，@王五 大家加油！', createdAt: '2024-07-20T10:00:00Z', mentions: ['u3'] },
      { id: 'c1-2', userId: 'u1', text: '收到，后端进度正常，下周可以联调。', createdAt: '2024-07-21T11:30:00Z' }
    ],
    changeLog: [
      { id: 'cl1-1', userId: 'u1', field: 'status', oldValue: ProjectStatus.Discussion, newValue: ProjectStatus.InProgress, changedAt: '2024-07-19T14:00:00Z' },
      { id: 'cl1-2', userId: 'u3', field: 'priority', oldValue: Priority.P1, newValue: Priority.P0, changedAt: '2024-07-18T09:00:00Z' }
    ],
  },
  {
    id: 'p2',
    name: '支付系统重构',
    priority: Priority.P0,
    businessProblem: '现有支付流程复杂，掉单率高，影响用户体验和收入。',
    keyResultIds: ['kr2_1'],
    weeklyUpdate: '核心架构设计完成，进入编码阶段。',
    lastWeekUpdate: '<div>支付网关选型调研完成。</div>',
    status: ProjectStatus.Launched,
    productManagers: [
      { userId: 'u2', startDate: formatDate(addDays(today, -90)), endDate: formatDate(addDays(today, -5)) },
    ],
    backendDevelopers: [
      { userId: 'u6', startDate: formatDate(addDays(today, -80)), endDate: formatDate(addDays(today, -15)) },
      { userId: 'u8', startDate: formatDate(addDays(today, -80)), endDate: formatDate(addDays(today, -10)) },
    ],
    frontendDevelopers: [
      { userId: 'u7', startDate: formatDate(addDays(today, -60)), endDate: formatDate(addDays(today, -8)) },
    ],
    qaTesters: [
      { userId: 'u10', startDate: formatDate(addDays(today, -30)), endDate: formatDate(addDays(today, -6)) },
    ],
    proposalDate: formatDate(addDays(today, -120)),
    launchDate: formatDate(addDays(today, -5)),
    followers: ['u1'],
    comments: [],
    changeLog: [],
  },
  {
    id: 'p3',
    name: '管理后台 V2.0',
    priority: Priority.P1,
    businessProblem: '旧版后台操作繁琐，功能缺失，运营效率低下。',
    keyResultIds: ['kr3_1'],
    weeklyUpdate: '需求评审阶段，部分原型图已出。',
    lastWeekUpdate: '<div>完成了初步的需求收集。</div>',
    status: ProjectStatus.Discussion,
    productManagers: [
      { userId: 'u3', startDate: formatDate(today), endDate: formatDate(addDays(today, 60)) },
      { userId: 'u1', startDate: formatDate(today), endDate: formatDate(addDays(today, 60)) },
    ],
    backendDevelopers: [],
    frontendDevelopers: [],
    qaTesters: [],
    proposalDate: formatDate(addDays(today, -7)),
    launchDate: formatDate(addDays(today, 90)),
    followers: [],
    comments: [],
    changeLog: [],
  },
  {
    id: 'p4',
    name: 'AI智能客服机器人',
    priority: Priority.P1,
    businessProblem: '客服人力成本高，响应速度慢，需要引入AI提升效率和用户满意度。',
    keyResultIds: ['kr3_2'],
    weeklyUpdate: '核心意图识别模块开发完成，准确率达到85%。正在进行多轮对话逻辑的开发。',
    lastWeekUpdate: '<div>确定技术选型，使用RASA框架。</div>',
    status: ProjectStatus.InProgress,
    productManagers: [
      { userId: 'u3', startDate: formatDate(addDays(today, -40)), endDate: formatDate(addDays(today, 50)) },
    ],
    backendDevelopers: [
      { userId: 'u8', startDate: formatDate(addDays(today, -30)), endDate: formatDate(addDays(today, 50)) },
    ],
    frontendDevelopers: [
      { userId: 'u7', startDate: formatDate(addDays(today, -20)), endDate: formatDate(addDays(today, 40)) },
    ],
    qaTesters: [
      { userId: 'u10', startDate: formatDate(addDays(today, 10)), endDate: formatDate(addDays(today, 50)) },
    ],
    proposalDate: formatDate(addDays(today, -50)),
    launchDate: formatDate(addDays(today, 50)),
    followers: ['u1', 'u2'],
    comments: [
      { id: 'c4-1', userId: 'u1', text: '这个项目看起来很有挑战，@郑十 加油！AI部分是关键。', createdAt: formatDate(addDays(today, -15)) + 'T14:20:00Z', mentions: ['u8'] },
      { id: 'c4-2', userId: 'u3', text: '是的，我们正在攻克难关。下周会有一个demo。', createdAt: formatDate(addDays(today, -14)) + 'T09:00:00Z' }
    ],
    changeLog: [
      { id: 'cl4-1', userId: 'u3', field: 'status', oldValue: ProjectStatus.Discussion, newValue: ProjectStatus.InProgress, changedAt: formatDate(addDays(today, -30)) + 'T10:00:00Z' }
    ],
  },
  {
    id: 'p5',
    name: '数据中台建设',
    priority: Priority.P0,
    businessProblem: '各业务线数据孤岛问题严重，数据资产利用率低，决策缺少数据支持。',
    keyResultIds: ['kr2_2'],
    weeklyUpdate: 'ETL流程测试中，发现几个性能瓶颈，正在优化。数据报表前端展示已完成。',
    lastWeekUpdate: '<div>数据仓库模型设计评审通过。</div>',
    status: ProjectStatus.Testing,
    productManagers: [
      { userId: 'u2', startDate: formatDate(addDays(today, -100)), endDate: formatDate(addDays(today, 20)) },
    ],
    backendDevelopers: [
      { userId: 'u4', startDate: formatDate(addDays(today, -90)), endDate: formatDate(addDays(today, 20)) },
      { userId: 'u6', startDate: formatDate(addDays(today, -90)), endDate: formatDate(addDays(today, 20)) },
    ],
    frontendDevelopers: [
      { userId: 'u9', startDate: formatDate(addDays(today, -60)), endDate: formatDate(addDays(today, 10)) },
    ],
    qaTesters: [
      { userId: 'u5', startDate: formatDate(addDays(today, -20)), endDate: formatDate(addDays(today, 20)) },
    ],
    proposalDate: formatDate(addDays(today, -120)),
    launchDate: formatDate(addDays(today, 20)),
    followers: ['u3', 'u7', 'u1'],
    comments: [
      { id: 'c5-1', userId: 'u3', text: '这个项目非常关键，是公司今年的重点。', createdAt: formatDate(addDays(today, -5)) + 'T11:00:00Z' },
      { id: 'c5-2', userId: 'u2', text: '感谢关注！@赵六 @周八 我们会确保数据质量。', createdAt: formatDate(addDays(today, -4)) + 'T18:00:00Z', mentions: ['u4', 'u6'] },
      { id: 'c5-3', userId: 'u4', text: '收到，正在跟进SQL优化。', createdAt: formatDate(addDays(today, -3)) + 'T19:30:00Z' }
    ],
    changeLog: [],
  },
  {
    id: 'p6',
    name: '官网2024版改版',
    priority: Priority.P2,
    businessProblem: '旧版官网风格陈旧，无法体现公司新品牌形象，且移动端体验差。',
    keyResultIds: ['kr1_2'],
    weeklyUpdate: '后端接口开发完成，前端正在集成。',
    lastWeekUpdate: '<div>完成UI/UX设计稿。</div>',
    status: ProjectStatus.DevDone,
    productManagers: [
      { userId: 'u1', startDate: formatDate(addDays(today, -50)), endDate: formatDate(addDays(today, 10)) },
    ],
    backendDevelopers: [
      { userId: 'u6', startDate: formatDate(addDays(today, -40)), endDate: formatDate(addDays(today, 0)) },
    ],
    frontendDevelopers: [
      { userId: 'u5', startDate: formatDate(addDays(today, -30)), endDate: formatDate(addDays(today, 10)) },
    ],
    qaTesters: [
      { userId: 'u9', startDate: formatDate(addDays(today, 0)), endDate: formatDate(addDays(today, 10)) },
    ],
    proposalDate: formatDate(addDays(today, -60)),
    launchDate: formatDate(addDays(today, 10)),
    followers: ['u2', 'u3', 'u4', 'u7', 'u8', 'u10'],
    comments: [
      { id: 'c6-1', userId: 'u2', text: '新设计稿很棒！期待上线效果。', createdAt: formatDate(addDays(today, -25)) + 'T10:00:00Z'},
      { id: 'c6-2', userId: 'u1', text: '@孙七 前端同学加油，争取下周提测！', createdAt: formatDate(addDays(today, -1)) + 'T16:00:00Z', mentions: ['u5'] }
    ],
    changeLog: [],
  }
];