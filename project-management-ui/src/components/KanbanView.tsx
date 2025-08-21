import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { PROJECT_STATUSES, STATUS_COLORS, ProjectStatus } from '../constants/projectStatus';

type ViewMode = 'week' | 'month';

interface Project {
  id: string;
  name: string;
  role: string;
  color: string;
  startDate: string;
  endDate: string;
  priority: string;
  businessProblem: string;
  relatedKRs: string[];
  status: ProjectStatus;
}

interface TeamMember {
  name: string;
  projects: Project[];
}

// 模拟OKR数据
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

const KanbanView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 18)); // 2025年8月18日
  
  // 筛选状态
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedKRs, setSelectedKRs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 团队成员和项目数据
  const teamData: TeamMember[] = [
    {
      name: '张三',
      projects: [
        { 
          id: '1', 
          name: '官网2024版改版', 
          role: '产品', 
          color: 'bg-emerald-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-08',
          priority: '日常需求',
          businessProblem: '旧版官网信息陈旧，无法体现公司品牌形象，且转化效果差。',
          relatedKRs: ['kr1_2'],
          status: '待测试' as ProjectStatus
        },
        { 
          id: '2', 
          name: 'Q3 用户增长计划', 
          role: '产品', 
          color: 'bg-rose-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '新用户注册转化率较低，需要提升产品体验和转化。',
          relatedKRs: ['kr1_1', 'kr1_2'],
          status: '开发中' as ProjectStatus
        },
        { 
          id: '3', 
          name: '数据中台建设', 
          role: '产品', 
          color: 'bg-violet-500', 
          startDate: '2025-08-25', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '各业务线数据孤岛问题严重，数据资产无法有效利用。',
          relatedKRs: ['kr2_1'],
          status: '测试中' as ProjectStatus
        }
      ]
    },
    {
      name: '李四',
      projects: [
        { 
          id: '4', 
          name: 'AI智能客服机器人', 
          role: '产品', 
          color: 'bg-cyan-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '临时重要需求',
          businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升效率。',
          relatedKRs: ['kr3_1'],
          status: '开发中' as ProjectStatus
        },
        { 
          id: '5', 
          name: '数据中台建设', 
          role: '后端', 
          color: 'bg-violet-500', 
          startDate: '2025-08-25', 
          endDate: '2025-09-08',
          priority: '部门OKR相关',
          businessProblem: '各业务线数据孤岛问题严重，数据资产无法有效利用。',
          relatedKRs: ['kr2_1'],
          status: '测试中' as ProjectStatus
        },
        { 
          id: '6', 
          name: 'Q3 用户增长计划', 
          role: '后端', 
          color: 'bg-rose-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '新用户注册转化率较低，需要提升产品体验和转化。',
          relatedKRs: ['kr1_1', 'kr1_2'],
          status: '开发中' as ProjectStatus
        }
      ]
    },
    {
      name: '赵六',
      projects: [
        { 
          id: '7', 
          name: 'Q3 用户增长计划', 
          role: '后端', 
          color: 'bg-rose-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '新用户注册转化率较低，需要提升产品体验和转化。',
          relatedKRs: ['kr1_1', 'kr1_2'],
          status: '开发中' as ProjectStatus
        },
        { 
          id: '8', 
          name: 'Q3 用户增长计划', 
          role: '前端', 
          color: 'bg-rose-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '新用户注册转化率较低，需要提升产品体验和转化。',
          relatedKRs: ['kr1_1', 'kr1_2'],
          status: '开发中' as ProjectStatus
        }
      ]
    },
    {
      name: '孙七',
      projects: [
        { 
          id: '9', 
          name: '官网2024版改版', 
          role: '后端', 
          color: 'bg-emerald-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-01',
          priority: '日常需求',
          businessProblem: '旧版官网信息陈旧，无法体现公司品牌形象，且转化效果差。',
          relatedKRs: ['kr1_2'],
          status: '待测试' as ProjectStatus
        },
        { 
          id: '10', 
          name: '数据中台建设', 
          role: '前端', 
          color: 'bg-violet-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '各业务线数据孤岛问题严重，数据资产无法有效利用。',
          relatedKRs: ['kr2_1'],
          status: '测试中' as ProjectStatus
        },
        { 
          id: '11', 
          name: '数据中台建设', 
          role: '测试', 
          color: 'bg-violet-500', 
          startDate: '2025-09-01', 
          endDate: '2025-09-15',
          priority: '部门OKR相关',
          businessProblem: '各业务线数据孤岛问题严重，数据资产无法有效利用。',
          relatedKRs: ['kr2_1'],
          status: '测试中' as ProjectStatus
        }
      ]
    },
    {
      name: '周八',
      projects: [
        { 
          id: '12', 
          name: 'AI智能客服机器人', 
          role: '前端', 
          color: 'bg-cyan-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '临时重要需求',
          businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升效率。',
          relatedKRs: ['kr3_1'],
          status: '开发中' as ProjectStatus
        }
      ]
    },
    {
      name: '吴九',
      projects: [
        { 
          id: '13', 
          name: 'AI智能客服机器人', 
          role: '后端', 
          color: 'bg-cyan-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '临时重要需求',
          businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升效率。',
          relatedKRs: ['kr3_1'],
          status: '开发中' as ProjectStatus
        }
      ]
    },
    {
      name: '郑十',
      projects: [
        { 
          id: '14', 
          name: 'AI智能客服机器人', 
          role: '前端', 
          color: 'bg-cyan-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-15',
          priority: '临时重要需求',
          businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升效率。',
          relatedKRs: ['kr3_1'],
          status: '开发中' as ProjectStatus
        },
        { 
          id: '15', 
          name: '数据中台建设', 
          role: '测试', 
          color: 'bg-violet-500', 
          startDate: '2025-08-25', 
          endDate: '2025-09-08',
          priority: '部门OKR相关',
          businessProblem: '各业务线数据孤岛问题严重，数据资产无法有效利用。',
          relatedKRs: ['kr2_1'],
          status: '测试中' as ProjectStatus
        }
      ]
    },
    {
      name: '陈十一',
      projects: [
        { 
          id: '16', 
          name: 'Q3 用户增长计划', 
          role: '测试', 
          color: 'bg-rose-500', 
          startDate: '2025-08-25', 
          endDate: '2025-09-08',
          priority: '部门OKR相关',
          businessProblem: '新用户注册转化率较低，需要提升产品体验和转化。',
          relatedKRs: ['kr1_1', 'kr1_2'],
          status: '开发中' as ProjectStatus
        },
        { 
          id: '17', 
          name: '官网2024版改版', 
          role: '测试', 
          color: 'bg-emerald-500', 
          startDate: '2025-08-18', 
          endDate: '2025-09-01',
          priority: '日常需求',
          businessProblem: '旧版官网信息陈旧，无法体现公司品牌形象，且转化效果差。',
          relatedKRs: ['kr1_2'],
          status: '待测试' as ProjectStatus
        }
      ]
    },
    {
      name: '卫十二',
      projects: [
        { 
          id: '18', 
          name: 'AI智能客服机器人', 
          role: '测试', 
          color: 'bg-cyan-500', 
          startDate: '2025-09-01', 
          endDate: '2025-09-08',
          priority: '临时重要需求',
          businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升效率。',
          relatedKRs: ['kr3_1'],
          status: '开发中' as ProjectStatus
        }
      ]
    }
  ];

  // 获取所有成员
  const allMembers = useMemo(() => {
    return teamData.map(member => member.name);
  }, []);

  // 获取所有优先级
  const allPriorities = ['部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求'];

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

  // 生成时间轴
  const generateTimeAxis = useMemo(() => {
    if (viewMode === 'week') {
      const weeks = [];
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // 获取周一
      
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        weeks.push({
          id: `week-${i}`,
          label: `W${34 + i}`,
          subLabel: `${weekStart.getMonth() + 1}月${weekStart.getDate()}日`,
          startDate: weekStart,
          endDate: weekEnd
        });
      }
      return weeks;
    } else {
      const months = [];
      const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      for (let i = 0; i < 3; i++) {
        const monthDate = new Date(startMonth);
        monthDate.setMonth(startMonth.getMonth() + i);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        months.push({
          id: `month-${i}`,
          label: `${monthDate.getMonth() + 1}月`,
          subLabel: `${monthDate.getFullYear()}年`,
          startDate: monthDate,
          endDate: monthEnd
        });
      }
      return months;
    }
  }, [viewMode, currentDate]);

  // 计算项目在时间轴上的位置
  const calculateProjectPosition = (project: Project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const timeAxisStart = generateTimeAxis[0].startDate;
    const timeAxisEnd = generateTimeAxis[generateTimeAxis.length - 1].endDate;
    
    const totalDuration = timeAxisEnd.getTime() - timeAxisStart.getTime();
    const projectStartOffset = Math.max(0, projectStart.getTime() - timeAxisStart.getTime());
    const projectDuration = Math.min(projectEnd.getTime(), timeAxisEnd.getTime()) - Math.max(projectStart.getTime(), timeAxisStart.getTime());
    
    const leftPercent = (projectStartOffset / totalDuration) * 100;
    const widthPercent = (projectDuration / totalDuration) * 100;
    
    return { left: leftPercent, width: Math.max(widthPercent, 2) }; // 最小宽度2%
  };

  // 筛选数据
  const filteredTeamData = useMemo(() => {
    return teamData.filter(member => {
      // 成员筛选
      if (selectedMembers.length > 0 && !selectedMembers.includes(member.name)) return false;
      
      // 检查成员的项目是否符合其他筛选条件
      const hasMatchingProject = member.projects.some(project => {
        // 优先级筛选
        if (selectedPriorities.length > 0 && !selectedPriorities.includes(project.priority)) return false;
        
        // KR筛选
        if (selectedKRs.length > 0 && !project.relatedKRs.some(kr => selectedKRs.includes(kr))) return false;
        
        // 项目名称搜索
        if (searchQuery.trim() && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        return true;
      });
      
      return hasMatchingProject;
    }).map(member => ({
      ...member,
      projects: member.projects.filter(project => {
        // 优先级筛选
        if (selectedPriorities.length > 0 && !selectedPriorities.includes(project.priority)) return false;
        
        // KR筛选
        if (selectedKRs.length > 0 && !project.relatedKRs.some(kr => selectedKRs.includes(kr))) return false;
        
        // 项目名称搜索
        if (searchQuery.trim() && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        return true;
      })
    }));
  }, [teamData, selectedMembers, selectedPriorities, selectedKRs, searchQuery]);

  // 导航时间
  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // 获取当前时间范围显示文本
  const getTimeRangeText = () => {
    if (viewMode === 'week') {
      const start = generateTimeAxis[0].startDate;
      const end = generateTimeAxis[generateTimeAxis.length - 1].endDate;
      return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
    } else {
      return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月 - ${currentDate.getMonth() + 3}月`;
    }
  };

  // 获取项目关联的KR信息
  const getProjectKRs = (krIds: string[]) => {
    const krs: { objective: string; keyResult: string }[] = [];
    mockOKRSets.forEach(set => {
      set.okrs.forEach(okr => {
        okr.keyResults.forEach(kr => {
          if (krIds.includes(kr.id)) {
            krs.push({
              objective: okr.objective,
              keyResult: kr.description
            });
          }
        });
      });
    });
    return krs;
  };

  // 多选筛选器组件
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

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* 顶部筛选栏 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-8 py-6 shadow-sm">
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">筛选条件</span>
            </div>
            
            {/* 项目名称搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索项目名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 bg-white/70 border-gray-200 hover:bg-white transition-colors"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            <MultiSelectFilter
              title="成员"
              options={allMembers}
              selectedValues={selectedMembers}
              onSelectionChange={setSelectedMembers}
            />

            <MultiSelectFilter
              title="优先级"
              options={allPriorities}
              selectedValues={selectedPriorities}
              onSelectionChange={setSelectedPriorities}
            />

            <MultiSelectFilter
              title="KR"
              options={krOptions}
              selectedValues={selectedKRs}
              onSelectionChange={setSelectedKRs}
            />
          </div>
        </div>

        {/* 时间导航栏 */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 视图模式切换 */}
              <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'week' 
                      ? 'bg-white text-blue-600 shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  周视图
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'month' 
                      ? 'bg-white text-blue-600 shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  月视图
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTime('prev')}
                className="hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{getTimeRangeText()}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTime('next')}
                className="hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 甘特图主体 */}
        <div className="mx-8 mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/50">
          {/* 表头 */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex">
              {/* 成员列标题 */}
              <div className="w-48 px-6 py-4 border-r border-gray-200 bg-white/50">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">团队成员</span>
              </div>
              
              {/* 时间列标题 */}
              <div className="flex-1 flex">
                {generateTimeAxis.map((timeUnit, index) => (
                  <div key={timeUnit.id} className="flex-1 px-4 py-4 border-r border-gray-200 last:border-r-0 text-center">
                    <div className="text-sm font-semibold text-gray-800">{timeUnit.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{timeUnit.subLabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 甘特图内容 */}
          <div className="divide-y divide-gray-100">
            {filteredTeamData.map((member, memberIndex) => (
              <div key={memberIndex} className="flex hover:bg-blue-50/30 transition-colors duration-200 group">
                {/* 成员名称 */}
                <div className="w-48 px-6 py-8 border-r border-gray-200 flex items-center bg-white/80 group-hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  </div>
                </div>

                {/* 甘特条区域 */}
                <div className="flex-1 relative bg-gradient-to-r from-gray-50/50 to-white" style={{ minHeight: '100px' }}>
                  {/* 时间槽背景网格 */}
                  <div className="absolute inset-0 flex">
                    {generateTimeAxis.map((_, index) => (
                      <div key={index} className="flex-1 border-r border-gray-100 last:border-r-0" />
                    ))}
                  </div>

                  {/* 项目甘特条 */}
                  {member.projects.map((project, projectIndex) => {
                    const position = calculateProjectPosition(project);
                    const projectKRs = getProjectKRs(project.relatedKRs);
                    
                    return (
                      <Tooltip key={project.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute rounded-lg px-3 py-2 text-xs text-white font-medium shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 ${project.color} group/project`}
                            style={{
                              left: `${position.left}%`,
                              width: `${position.width}%`,
                              top: `${projectIndex * 28 + 16}px`,
                              height: '24px',
                              zIndex: 10
                            }}
                          >
                            <div className="flex items-center gap-2 h-full">
                              <span className="truncate flex-1 leading-none">
                                {project.name}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className="bg-white/20 text-white border-white/30 text-xs px-1 py-0 h-4 opacity-0 group-hover/project:opacity-100 transition-opacity"
                              >
                                {project.role}
                              </Badge>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm p-4 bg-white border border-gray-200 shadow-lg">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {project.role}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    project.priority === '部门OKR相关' ? 'border-red-200 text-red-700 bg-red-50' :
                                    project.priority === '个人OKR相关' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                    project.priority === '临时重要需求' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                    'border-gray-200 text-gray-700 bg-gray-50'
                                  }`}
                                >
                                  {project.priority}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-700 font-medium mb-1">解决的问题：</p>
                              <p className="text-xs text-gray-600 leading-relaxed">{project.businessProblem}</p>
                            </div>
                            
                            {projectKRs.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-700 font-medium mb-2">关联KR：</p>
                                <div className="space-y-2">
                                  {projectKRs.map((kr, index) => (
                                    <div key={index} className="text-xs">
                                      <div className="font-medium text-gray-800 mb-1">O: {kr.objective}</div>
                                      <div className="text-gray-600 ml-2">KR: {kr.keyResult}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-sm text-gray-700 font-medium mb-1">排期时间：</p>
                              <p className="text-xs text-gray-600">
                                {new Date(project.startDate).toLocaleDateString('zh-CN')} - {new Date(project.endDate).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 无数据提示 */}
          {filteredTeamData.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">没有找到符合条件的数据</p>
              <p className="text-sm mt-2">请调整筛选条件后重试</p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default KanbanView;
