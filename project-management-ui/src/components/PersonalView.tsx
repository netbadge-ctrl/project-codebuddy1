import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Target, MessageCircle, MoreHorizontal, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { STATUS_COLORS, ProjectStatus } from '../constants/projectStatus';

const PersonalView: React.FC = () => {
  // 当前用户ID（实际应用中从认证上下文获取）
  const currentUserId = 'u1'; // 张三
  
  // 获取当前日期信息
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // 本周开始（周日）
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // 本周结束（周六）

  // 模拟项目数据（实际应用中应从API获取）
  const allProjects = [
    {
      id: 1,
      name: 'Q3 用户增长计划',
      status: '开发中' as ProjectStatus,
      participants: ['u1', 'u2'], // 张三、李四参与
      keyResultIds: ['O1-KR1', 'O1-KR2'], // 绑定了KR
      launchDate: '2025-09-19',
      createdAt: '2025-06-21'
    },
    {
      id: 2,
      name: '支付系统重构',
      status: '已上线' as ProjectStatus,
      participants: ['u1', 'u3'], // 张三、赵六参与
      keyResultIds: ['O2-KR1'], // 绑定了KR
      launchDate: '2025-08-18', // 本周上线（假设今天是8月20日）
      createdAt: '2025-04-22'
    },
    {
      id: 3,
      name: '数据中台建设',
      status: '测试中' as ProjectStatus,
      participants: ['u2', 'u4'], // 李四、王五参与
      keyResultIds: ['O2-KR1'], // 绑定了KR
      launchDate: '2025-09-09',
      createdAt: '2025-04-22'
    },
    {
      id: 4,
      name: '管理后台 V2.0',
      status: '需求讨论' as ProjectStatus,
      participants: ['u1', 'u4'], // 张三、王五参与
      keyResultIds: ['O3-KR1', 'O3-KR2'], // 绑定了KR
      launchDate: '2025-10-09',
      createdAt: '2025-07-11'
    },
    {
      id: 5,
      name: '管网2024版改版',
      status: '待测试' as ProjectStatus,
      participants: ['u1'], // 张三参与
      keyResultIds: [], // 未绑定KR
      launchDate: '2025-08-30',
      createdAt: '2025-07-01'
    },
    {
      id: 6,
      name: 'AI智能客服机器人',
      status: '开发中' as ProjectStatus,
      participants: ['u4', 'u5'], // 王五、孙七参与
      keyResultIds: ['O3-KR2'], // 绑定了KR
      launchDate: '2025-10-09',
      createdAt: '2025-07-11'
    },
    {
      id: 7,
      name: '用户体验优化项目',
      status: '已上线' as ProjectStatus,
      participants: ['u1', 'u2'], // 张三、李四参与
      keyResultIds: ['O1-KR2'], // 绑定了KR
      launchDate: '2025-07-30', // 年内已上线
      createdAt: '2025-05-15'
    },
    {
      id: 8,
      name: '移动端适配项目',
      status: '已上线' as ProjectStatus,
      participants: ['u1'], // 张三参与
      keyResultIds: [], // 未绑定KR
      launchDate: '2025-06-15', // 年内已上线
      createdAt: '2025-04-01'
    }
  ];

  // 计算统计数据
  const stats = useMemo(() => {
    // 我参与的项目
    const myProjects = allProjects.filter(project => 
      project.participants.includes(currentUserId)
    );

    // 1. 本周上线项目 - 我参与的、状态为'已上线'且上线日期在本周内的项目数量
    const thisWeekOnlineProjects = myProjects.filter(project => {
      if (project.status !== '已上线') return false;
      const launchDate = new Date(project.launchDate);
      return launchDate >= currentWeekStart && launchDate <= currentWeekEnd;
    });

    // 2. 年内完成项目 - 当前自然年内我参与的且状态为'已上线'的项目总数
    const yearCompletedProjects = myProjects.filter(project => {
      if (project.status !== '已上线') return false;
      const launchDate = new Date(project.launchDate);
      return launchDate.getFullYear() === currentYear;
    });

    // 3. 进行中OKR项目 - 当前自然年内我参与的、绑定了KR且状态未标记为'已上线'的项目数量
    const ongoingOKRProjects = myProjects.filter(project => {
      if (project.status === '已上线') return false; // 状态未标记为'已上线'
      if (project.keyResultIds.length === 0) return false; // 绑定了KR
      const createdDate = new Date(project.createdAt);
      return createdDate.getFullYear() === currentYear; // 当前自然年内
    });

    // 4. 已完成OKR项目 - 当前自然年内我参与的、状态为'已上线'且绑定了KR的项目总数
    const completedOKRProjects = myProjects.filter(project => {
      if (project.status !== '已上线') return false; // 状态为'已上线'
      if (project.keyResultIds.length === 0) return false; // 绑定了KR
      const launchDate = new Date(project.launchDate);
      return launchDate.getFullYear() === currentYear; // 当前自然年内
    });

    return [
      { 
        label: '本周上线项目', 
        value: thisWeekOnlineProjects.length.toString(), 
        color: 'bg-green-500', 
        icon: TrendingUp
      },
      { 
        label: '年内完成项目', 
        value: yearCompletedProjects.length.toString(), 
        color: 'bg-blue-500', 
        icon: BarChart3
      },
      { 
        label: '进行中OKR项目', 
        value: ongoingOKRProjects.length.toString(), 
        color: 'bg-orange-500', 
        icon: AlertCircle
      },
      { 
        label: '已完成OKR项目', 
        value: completedOKRProjects.length.toString(), 
        color: 'bg-purple-500', 
        icon: Target
      },
    ];
  }, [currentUserId, currentYear, currentWeekStart, currentWeekEnd]);

  // 正在参与的项目
  const activeProjects = [
    {
      name: 'Q3 用户增长计划',
      status: '开发中' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      pm: '张三',
      backend: '李四',
      startDate: '2025-06-21',
      endDate: '2025-09-19',
    },
    {
      name: '管理后台 V2.0',
      status: '需求讨论' as ProjectStatus,
      priority: '个人OKR相关',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      pm: '王五, 张三',
      backend: '李四',
      startDate: '2025-08-13',
      endDate: '2025-11-18',
    },
    {
      name: '管网2024版改版',
      status: '待测试' as ProjectStatus,
      priority: '日常需求',
      priorityColor: 'bg-blue-100 text-blue-800',
      pm: '张三',
      backend: '李四',
      startDate: '2025-06-21',
      endDate: '2025-08-30',
    },
  ];

  // 关注的项目
  const followedProjects = [
    {
      name: '支付系统重构',
      status: '已上线' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      pm: '李四',
      backend: '赵六',
      startDate: '2025-04-22',
      endDate: '2025-08-15',
    },
    {
      name: 'AI智能客服机器人',
      status: '开发中' as ProjectStatus,
      priority: '临时重要需求',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      pm: '王五',
      backend: '孙七',
      startDate: '2025-07-01',
      endDate: '2025-10-09',
    },
    {
      name: '数据中台建设',
      status: '测试中' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      pm: '李四',
      backend: '周八',
      startDate: '2025-04-22',
      endDate: '2025-09-09',
    },
  ];

  // 评论动态
  const comments = [
    {
      user: '张三',
      action: '评论了',
      project: '管网2024版改版',
      time: '2025年08月20日 09:00',
      content: '@孙七 前端开发加油，争取下周能上线！',
    },
    {
      user: '赵六',
      action: '评论了',
      project: '数据中台建设',
      time: '2025年08月19日 03:00',
      content: '收到，正在优化SQL优化。',
    },
    {
      user: '李四',
      action: '评论了',
      project: '数据中台建设',
      time: '2025年08月19日 18:00',
      content: '这个项目非常关键，是公司今年的重点。',
    },
    {
      user: '王五',
      action: '评论了',
      project: 'AI智能客服机器人',
      time: '2025年08月17日 17:00',
      content: '昨天，我们正在改善相关了。下周会有一个Demo。',
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 正在参与的项目 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              我正在参与的正在进行的项目 <span className="text-gray-500">(3)</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {activeProjects.map((project, index) => (
              <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{project.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={STATUS_COLORS[project.status]}>{project.status}</Badge>
                        <Badge className={project.priorityColor}>{project.priority}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">产品经理:</span> {project.pm}
                    </div>
                    <div>
                      <span className="text-gray-500">后端开发:</span> {project.backend}
                    </div>
                    <div>
                      <span className="text-gray-500">上线时间:</span> {project.endDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 关注的项目 */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                我关注的项目 <span className="text-gray-500">(3)</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {followedProjects.map((project, index) => (
                <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{project.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={STATUS_COLORS[project.status]}>{project.status}</Badge>
                          <Badge className={project.priorityColor}>{project.priority}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">产品经理:</span> {project.pm}
                      </div>
                      <div>
                        <span className="text-gray-500">后端开发:</span> {project.backend}
                      </div>
                      <div>
                        <span className="text-gray-500">上线时间:</span> {project.endDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 评论动态 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">过去两周的项目评论</h2>
          
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-gray-900">{comment.user}</span>
                        <span className="text-gray-500 text-sm">{comment.action}</span>
                        <span className="font-medium text-blue-600 text-sm">{comment.project}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{comment.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{comment.time}</span>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                          回复
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalView;