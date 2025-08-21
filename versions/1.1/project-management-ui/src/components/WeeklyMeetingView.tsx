import React, { useState, useMemo } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { PROJECT_STATUSES, STATUS_COLORS, ProjectStatus } from '../constants/projectStatus';
import CommentModal from './CommentModal';

// 模拟OKR数据 - 应该从OKR管理页面获取
const mockOKRSets = [
  {
    periodId: '2025-H2',
    periodName: '2025下半年',
    okrs: [
      {
        id: 'okr1',
        objective: '实现季度新用户增长30%，提升应用商店排名至前十',
        keyResults: [
          { id: 'kr1_1', description: '完成3次线上市场推广活动' },
          { id: 'kr1_2', description: '应用商店评分提升至4.8分' }
        ]
      },
      {
        id: 'okr2',
        objective: '将支付成功率提升至99.5%，减少支付相关投诉均时长50%',
        keyResults: [
          { id: 'kr2_1', description: '重构支付网关，减少技术故障率90%' },
          { id: 'kr2_2', description: '优化支付流程用户体验' }
        ]
      },
      {
        id: 'okr3',
        objective: '新版后台上线，提升运营人员日均操作效率40%',
        keyResults: [
          { id: 'kr3_1', description: '收集运营团队反馈，完成10项核心功能优化' },
          { id: 'kr3_2', description: '新后台系统Bug率低于0.1%' }
        ]
      }
    ]
  }
];

const WeeklyMeetingView: React.FC = () => {
  // 初始化默认筛选条件
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['部门OKR相关']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(PROJECT_STATUSES);
  const [selectedKRs, setSelectedKRs] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(['张三', '李四', '王五', '赵六', '孙七', '周八', '陈十一', '卫十二']);
  
  // 评论弹窗状态
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // 模拟用户数据
  const mockUsers = [
    { id: 'u1', name: '张三' },
    { id: 'u2', name: '李四' },
    { id: 'u3', name: '王五' },
    { id: 'u4', name: '赵六' },
    { id: 'u5', name: '孙七' },
    { id: 'u6', name: '周八' },
    { id: 'u7', name: '陈十一' },
    { id: 'u8', name: '卫十二' },
  ];

  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Q3 用户增长计划',
      status: '部门OKR相关',
      statusColor: 'bg-red-100 text-red-800',
      currentStatus: '开发中' as ProjectStatus,
      pm: '张三',
      businessProblem: '新用户注册转化率较低，需要提升产品体验和转化。',
      relatedKRs: ['kr1_1', 'kr1_2'],
      teamSchedule: {
        product: '张三 2025.07.06 - 2025.09.19',
        backend: '赵六 2025.07.06 - 2025.09.19',
        frontend: '孙七 2025.07.21 - 2025.09.09',
        testing: '陈十一 2025.08.28 - 2025.09.19',
      },
      thisWeekProgress: '确定了市场推广的核心主题和策略。',
      lastWeekProgress: '市场活动已启动，预计合作伙伴数量增长。',
      comments: [
        { id: 'c1', userId: 'u1', text: '进展不错，继续保持', createdAt: '2025-08-18T10:00:00Z', mentions: [] },
        { id: 'c2', userId: 'u2', text: '需要关注转化率数据', createdAt: '2025-08-19T14:30:00Z', mentions: [] }
      ],
      participants: ['张三', '赵六', '孙七', '陈十一']
    },
    {
      id: '2',
      name: '数据中台建设',
      status: '部门OKR相关',
      statusColor: 'bg-red-100 text-red-800',
      currentStatus: '测试中' as ProjectStatus,
      pm: '李四',
      businessProblem: '各业务线数据孤岛问题严重，数据资产无法有效利用。',
      relatedKRs: ['kr2_1'],
      teamSchedule: {
        product: '王五 2025.08.20 - 2025.10.19',
        backend: '张三 2025.08.20 - 2025.10.19',
        frontend: '李四 2025.08.20 - 2025.10.19',
        testing: '赵六 2025.07.31 - 2025.09.29',
      },
      thisWeekProgress: 'ETL流程调试中，发现几个性能瓶颈，正在优化。',
      lastWeekProgress: '数据接口整理完成，计划审查通过。',
      comments: [
        { id: 'c3', userId: 'u3', text: '架构设计很棒', createdAt: '2025-08-17T09:15:00Z', mentions: [] },
        { id: 'c4', userId: 'u4', text: '性能优化需要重点关注', createdAt: '2025-08-18T16:20:00Z', mentions: [] },
        { id: 'c5', userId: 'u5', text: '测试用例覆盖率如何？', createdAt: '2025-08-19T11:45:00Z', mentions: [] }
      ],
      participants: ['李四', '王五', '张三', '赵六']
    },
    {
      id: '3',
      name: '管理后台 V2.0',
      status: '个人OKR相关',
      statusColor: 'bg-yellow-100 text-yellow-800',
      currentStatus: '需求讨论' as ProjectStatus,
      pm: '王五, 张三',
      businessProblem: '旧版后台合规性差，功能缺失，运营效率不高。',
      relatedKRs: ['kr3_1', 'kr3_2'],
      teamSchedule: {
        product: '王五 2025.07.11 - 2025.10.09',
        backend: '赵六 2025.07.07 - 2025.10.09',
        frontend: '孙七 2025.07.31 - 2025.09.29',
        testing: '卫十二 2025.08.30 - 2025.10.09',
      },
      thisWeekProgress: '完成了初步的需求收集。',
      lastWeekProgress: '需求详细梳理，部分功能已出设计。',
      comments: [],
      participants: ['王五', '张三', '赵六', '孙七', '卫十二']
    },
    {
      id: '4',
      name: 'AI智能客服机器人',
      status: '临时重要需求',
      statusColor: 'bg-orange-100 text-orange-800',
      currentStatus: '开发中' as ProjectStatus,
      pm: '王五',
      businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升效率。',
      relatedKRs: ['kr3_1'],
      teamSchedule: {
        product: '王五 2025.07.11 - 2025.10.09',
        backend: '周八 2025.07.11 - 2025.10.09',
        frontend: '孙七 2025.07.31 - 2025.09.29',
        testing: '卫十二 2025.08.30 - 2025.10.09',
      },
      thisWeekProgress: '确定技术方案，使用RASA框架。',
      lastWeekProgress: '核心算法已完成，正在进行ASA训练。',
      comments: [
        { id: 'c6', userId: 'u2', text: '技术方案很不错', createdAt: '2025-08-18T13:25:00Z', mentions: [] },
        { id: 'c7', userId: 'u3', text: '需要考虑多语言支持', createdAt: '2025-08-19T10:10:00Z', mentions: [] }
      ],
      participants: ['王五', '周八', '孙七', '卫十二']
    },
    {
      id: '5',
      name: '官网2024版改版',
      status: '日常需求',
      statusColor: 'bg-blue-100 text-blue-800',
      currentStatus: '待测试' as ProjectStatus,
      pm: '张三',
      businessProblem: '旧版官网信息陈旧，无法体现公司品牌形象，且转化效果差。',
      relatedKRs: ['kr1_2'],
      teamSchedule: {
        product: '张三 2025.07.01 - 2025.08.30',
        backend: '周八 2025.07.11 - 2025.08.20',
        frontend: '孙七 2025.07.01 - 2025.08.30',
        testing: '陈十一 2025.08.20 - 2025.08.30',
      },
      thisWeekProgress: '完成UI/UX设计评审。',
      lastWeekProgress: '后端接口开发完成，前端正在集成。',
      comments: [
        { id: 'c8', userId: 'u1', text: '设计稿很漂亮', createdAt: '2025-08-17T15:30:00Z', mentions: [] },
        { id: 'c9', userId: 'u4', text: '移动端适配需要重点测试', createdAt: '2025-08-19T09:45:00Z', mentions: [] }
      ],
      participants: ['张三', '周八', '孙七', '陈十一']
    },
    {
      id: '6',
      name: '支付系统重构',
      status: '部门OKR相关',
      statusColor: 'bg-red-100 text-red-800',
      currentStatus: '已上线' as ProjectStatus,
      pm: '李四',
      businessProblem: '现有支付流程复杂，影响用户体验和收入转化。',
      relatedKRs: ['kr2_1', 'kr2_2'],
      teamSchedule: {
        product: '李四 2025.04.22 - 2025.08.15',
        backend: '赵六 2025.04.22 - 2025.08.15',
        frontend: '孙七 2025.05.01 - 2025.07.30',
        testing: '陈十一 2025.07.15 - 2025.08.15',
      },
      thisWeekProgress: '项目已成功上线，监控各项指标正常。',
      lastWeekProgress: '完成最终测试，准备上线部署。',
      comments: [
        { id: 'c10', userId: 'u1', text: '上线很顺利', createdAt: '2025-08-15T16:00:00Z', mentions: [] },
        { id: 'c11', userId: 'u2', text: '支付成功率确实提升了', createdAt: '2025-08-16T10:30:00Z', mentions: [] },
        { id: 'c12', userId: 'u3', text: '用户反馈很好', createdAt: '2025-08-17T14:20:00Z', mentions: [] },
        { id: 'c13', userId: 'u4', text: '需要继续监控性能指标', createdAt: '2025-08-18T09:15:00Z', mentions: [] },
        { id: 'c14', userId: 'u5', text: '下个版本可以考虑增加更多支付方式', createdAt: '2025-08-19T11:45:00Z', mentions: [] }
      ],
      participants: ['李四', '赵六', '孙七', '陈十一']
    },
  ]);

  // 获取所有KR选项，按O分组
  const krOptions = useMemo(() => {
    const groupedOptions: { [key: string]: { objective: string; keyResults: { value: string; label: string }[] } } = {};
    
    mockOKRSets.forEach(set => {
      set.okrs.forEach(okr => {
        if (!groupedOptions[okr.id]) {
          groupedOptions[okr.id] = {
            objective: okr.objective,
            keyResults: []
          };
        }
        okr.keyResults.forEach(kr => {
          groupedOptions[okr.id].keyResults.push({
            value: kr.id,
            label: kr.description
          });
        });
      });
    });
    
    return groupedOptions;
  }, []);

  // 初始化KR全选状态
  React.useEffect(() => {
    if (selectedKRs.length === 0 && Object.keys(krOptions).length > 0) {
      const allKRIds: string[] = [];
      Object.values(krOptions).forEach(group => {
        group.keyResults.forEach(kr => {
          allKRIds.push(kr.value);
        });
      });
      setSelectedKRs(allKRIds);
    }
  }, [krOptions, selectedKRs.length]);

  // 筛选项目
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(project.status)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.currentStatus)) return false;
      if (selectedKRs.length > 0 && !project.relatedKRs.some(kr => selectedKRs.includes(kr))) return false;
      if (selectedParticipants.length > 0 && !project.participants.some(p => selectedParticipants.includes(p))) return false;
      return true;
    });
  }, [projects, selectedPriorities, selectedStatuses, selectedKRs, selectedParticipants]);

  // 获取项目关联的OKR信息
  const getProjectOKRs = (krIds: string[]) => {
    const okrs: { objective: string; keyResult: string }[] = [];
    mockOKRSets.forEach(set => {
      set.okrs.forEach(okr => {
        okr.keyResults.forEach(kr => {
          if (krIds.includes(kr.id)) {
            okrs.push({
              objective: okr.objective,
              keyResult: kr.description
            });
          }
        });
      });
    });
    return okrs;
  };

  // 多选筛选器组件（支持全选）
  const MultiSelectFilter = ({ 
    title, 
    options, 
    selectedValues, 
    onSelectionChange 
  }: {
    title: string;
    options: string[] | { [key: string]: { objective: string; keyResults: { value: string; label: string }[] } };
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
  }) => {
    const isKRFilter = title === 'KR';
    
    // 计算所有可选值
    const getAllValues = () => {
      if (isKRFilter && typeof options === 'object' && !Array.isArray(options)) {
        const allKRs: string[] = [];
        Object.values(options).forEach(group => {
          group.keyResults.forEach(kr => {
            allKRs.push(kr.value);
          });
        });
        return allKRs;
      } else if (Array.isArray(options)) {
        return options;
      }
      return [];
    };

    const allValues = getAllValues();
    const isAllSelected = selectedValues.length === allValues.length;

    const toggleOption = (value: string) => {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter(v => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    };

    const toggleAll = () => {
      if (isAllSelected) {
        onSelectionChange([]);
      } else {
        onSelectionChange(allValues);
      }
    };

    const clearAll = () => {
      onSelectionChange([]);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-32 justify-between">
            {selectedValues.length === 0 ? title : `${title} (${selectedValues.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={isKRFilter ? "w-96 p-0" : "w-64 p-0"}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{title}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {isAllSelected ? '取消全选' : '全选'}
                </Button>
                {selectedValues.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    清空
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {isKRFilter && typeof options === 'object' && !Array.isArray(options) ? (
                // KR筛选：按O分组显示
                Object.entries(options).map(([okrId, group]) => (
                  <div key={okrId} className="space-y-2">
                    <div className="font-medium text-sm text-gray-900 border-b border-gray-200 pb-1">
                      O: {group.objective}
                    </div>
                    <div className="space-y-2 ml-2">
                      {group.keyResults.map(kr => (
                        <div key={kr.value} className="flex items-start space-x-2">
                          <Checkbox
                            id={kr.value}
                            checked={selectedValues.includes(kr.value)}
                            onCheckedChange={() => toggleOption(kr.value)}
                            className="mt-0.5"
                          />
                          <label htmlFor={kr.value} className="text-sm cursor-pointer flex-1 text-gray-700">
                            KR: {kr.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // 普通筛选：直接显示选项
                Array.isArray(options) && options.map(option => (
                  <div key={option} className="flex items-start space-x-2">
                    <Checkbox
                      id={option}
                      checked={selectedValues.includes(option)}
                      onCheckedChange={() => toggleOption(option)}
                      className="mt-0.5"
                    />
                    <label htmlFor={option} className="text-sm cursor-pointer flex-1">
                      {option}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // 打开评论弹窗
  const openCommentModal = (project: any) => {
    setSelectedProject(project);
    setCommentModalOpen(true);
  };

  // 添加评论
  const handleAddComment = (text: string, mentions: string[]) => {
    if (!selectedProject) return;

    const newComment = {
      id: `c${Date.now()}`,
      userId: 'u1', // 当前用户ID，实际应用中从认证上下文获取
      text,
      createdAt: new Date().toISOString(),
      mentions
    };

    // 更新项目评论
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === selectedProject.id 
          ? { ...project, comments: [...project.comments, newComment] }
          : project
      )
    );

    // 更新选中的项目
    setSelectedProject(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <MultiSelectFilter
            title="优先级"
            options={['部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求']}
            selectedValues={selectedPriorities}
            onSelectionChange={setSelectedPriorities}
          />

          <MultiSelectFilter
            title="状态"
            options={PROJECT_STATUSES}
            selectedValues={selectedStatuses}
            onSelectionChange={setSelectedStatuses}
          />

          <MultiSelectFilter
            title="KR"
            options={krOptions}
            selectedValues={selectedKRs}
            onSelectionChange={setSelectedKRs}
          />

          <MultiSelectFilter
            title="参与人"
            options={['张三', '李四', '王五', '赵六', '孙七', '周八', '陈十一', '卫十二']}
            selectedValues={selectedParticipants}
            onSelectionChange={setSelectedParticipants}
          />
        </div>
      </div>

      {/* 项目卡片网格 - 优化布局和样式 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredProjects.map((project, index) => {
          const projectOKRs = getProjectOKRs(project.relatedKRs);
          
          return (
            <Card key={project.id} className="bg-white flex flex-col h-full shadow-sm border border-gray-200">
              <CardContent className="p-5 flex flex-col h-full">
                {/* 项目名称和评论按钮 */}
                <div className="flex items-start justify-between mb-3 flex-shrink-0">
                  <h3 className="text-base font-medium text-gray-900 line-clamp-2 flex-1 pr-2">{project.name}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 h-auto flex-shrink-0"
                    onClick={() => openCommentModal(project)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="ml-1 text-xs">{project.comments.length}</span>
                  </Button>
                </div>

                {/* 状态和优先级 */}
                <div className="flex items-center gap-2 flex-wrap mb-4 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border-red-200">
                    {project.status}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border-blue-200">
                    {project.currentStatus}
                  </Badge>
                </div>

                <div className="space-y-4 flex-1">
                  {/* 解决的业务问题 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">解决的业务问题</h4>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{project.businessProblem}</p>
                  </div>

                  {/* 关联 OKR */}
                  {projectOKRs.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">关联 OKR</h4>
                      <div className="space-y-2">
                        {projectOKRs.slice(0, 2).map((okr, index) => (
                          <div key={index} className="text-xs">
                            <div className="font-medium line-clamp-1 text-gray-900">O: {okr.objective}</div>
                            <div className="text-gray-600 ml-2 line-clamp-1">• KR: {okr.keyResult}</div>
                          </div>
                        ))}
                        {projectOKRs.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{projectOKRs.length - 2} 个更多OKR
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 团队角色时间 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">团队角色与排期</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">产品</span>
                        <span className="text-right">{project.teamSchedule.product}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">后端</span>
                        <span className="text-right">{project.teamSchedule.backend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">前端</span>
                        <span className="text-right">{project.teamSchedule.frontend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">测试</span>
                        <span className="text-right">{project.teamSchedule.testing}</span>
                      </div>
                    </div>
                  </div>

                  {/* 进展信息 - 两列布局 */}
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">上周进展/问题</h4>
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{project.lastWeekProgress}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">本周进展/问题</h4>
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{project.thisWeekProgress}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 无数据提示 */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>没有找到符合条件的项目</p>
        </div>
      )}

      {/* 评论弹窗 */}
      {selectedProject && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setSelectedProject(null);
          }}
          projectName={selectedProject.name}
          comments={selectedProject.comments}
          users={mockUsers}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default WeeklyMeetingView;