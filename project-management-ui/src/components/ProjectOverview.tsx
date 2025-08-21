import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Eye, MessageCircle, History, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { PROJECT_STATUSES, STATUS_COLORS, ProjectStatus } from '../constants/projectStatus';

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

const ProjectOverview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [selectedKRs, setSelectedKRs] = useState<string[]>([]);

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

  // 项目数据 - 添加进展和问题字段
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Q3 用户增长计划',
      businessProblem: '用户增长缓慢，需要提升获客效率和用户留存率',
      status: '开发中' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      thisWeekProgress: '完成用户画像分析，开始A/B测试方案设计',
      thisWeekIssues: '数据接口延迟，影响测试进度',
      lastWeekProgress: '完成需求调研，确定技术方案',
      lastWeekIssues: '跨部门协调困难，会议较多',
      pm: '张三',
      backend: '李四, 赵六',
      frontend: '孙七',
      testing: '陈十一',
      proposalDate: '2025-06-21',
      launchDate: '2025-09-19',
      relatedKRs: ['kr1_1', 'kr1_2'],
    },
    {
      id: 2,
      name: '数据中台建设',
      businessProblem: '数据分散在各个系统中，缺乏统一的数据管理和分析平台',
      status: '测试中' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      thisWeekProgress: '完成核心模块测试，修复3个关键bug',
      thisWeekIssues: '性能测试发现内存泄漏问题',
      lastWeekProgress: '完成集成测试，部署到测试环境',
      lastWeekIssues: '测试环境不稳定，影响测试效率',
      pm: '李四',
      backend: '张三, 周八',
      frontend: '李四',
      testing: '赵六',
      proposalDate: '2025-04-22',
      launchDate: '2025-09-09',
      relatedKRs: ['kr2_1'],
    },
    {
      id: 3,
      name: '管理后台 V2.0',
      businessProblem: '现有后台操作复杂，运营效率低下，需要重新设计用户体验',
      status: '需求讨论' as ProjectStatus,
      priority: '个人OKR相关',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      thisWeekProgress: '完成原型设计评审，确定技术架构',
      thisWeekIssues: '运营团队反馈需求变更较多',
      lastWeekProgress: '收集运营团队需求，分析现有系统痛点',
      lastWeekIssues: '需求收集时间较长，各部门意见不统一',
      pm: '王五, 张三',
      backend: '赵六',
      frontend: '孙七',
      testing: '卫十二',
      proposalDate: '2025-07-11',
      launchDate: '2025-10-09',
      relatedKRs: ['kr3_1', 'kr3_2'],
    },
  ]);

  // 编辑状态管理
  const [editingCell, setEditingCell] = useState<{projectId: number, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // 模拟保存到数据库的函数
  const saveToDatabase = async (projectId: number, field: string, value: string) => {
    console.log(`保存项目 ${projectId} 的 ${field} 字段为: ${value}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  // 开始编辑
  const startEditing = (projectId: number, field: string, currentValue: string) => {
    setEditingCell({ projectId, field });
    setEditingValue(currentValue);
  };

  // 保存编辑
  const saveEdit = async () => {
    if (!editingCell) return;
    
    const { projectId, field } = editingCell;
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, [field]: editingValue }
        : project
    ));

    await saveToDatabase(projectId, field, editingValue);
    
    setEditingCell(null);
    setEditingValue('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // 处理输入框失焦
  const handleBlur = () => {
    saveEdit();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // 自动聚焦编辑输入框
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // 可编辑单元格组件
  const EditableCell: React.FC<{
    projectId: number;
    field: string;
    value: string;
    className?: string;
    multiline?: boolean;
  }> = ({ projectId, field, value, className = '', multiline = false }) => {
    const isEditing = editingCell?.projectId === projectId && editingCell?.field === field;
    
    if (isEditing) {
      if (multiline) {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full p-1 border border-blue-500 rounded resize-none bg-blue-50 ${className}`}
            rows={2}
          />
        );
      } else {
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full p-1 border border-blue-500 rounded bg-blue-50 ${className}`}
          />
        );
      }
    }

    return (
      <div 
        onClick={() => startEditing(projectId, field, value)}
        className={`cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors ${className}`}
        title="点击编辑"
      >
        {value || <span className="text-gray-400">点击添加...</span>}
      </div>
    );
  };

  // 通用多选筛选器组件
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
    const isKROptions = typeof options === 'object' && !Array.isArray(options);
    
    const getAllValues = () => {
      if (isKROptions) {
        const allKRs: string[] = [];
        Object.values(options as { [key: string]: { objective: string; keyResults: { value: string; label: string }[] } }).forEach(group => {
          group.keyResults.forEach(kr => {
            allKRs.push(kr.value);
          });
        });
        return allKRs;
      } else {
        return options as string[];
      }
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
        <PopoverContent className="w-96 p-0">
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
              {isKROptions ? (
                Object.entries(options as { [key: string]: { objective: string; keyResults: { value: string; label: string }[] } }).map(([okrId, group]) => (
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
                (options as string[]).map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={selectedValues.includes(option)}
                      onCheckedChange={() => toggleOption(option)}
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

  // 筛选项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(project.priority);
    const matchesKRs = selectedKRs.length === 0 || selectedKRs.some(kr => project.relatedKRs.includes(kr));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesKRs;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 控制区 */}
      <div className="flex items-center justify-between mb-6">
        {/* 筛选栏 */}
        <div className="flex flex-wrap gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索项目名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* 状态筛选 */}
          <MultiSelectFilter
            title="状态"
            options={PROJECT_STATUSES}
            selectedValues={statusFilter}
            onSelectionChange={setStatusFilter}
          />

          {/* 优先级筛选 */}
          <MultiSelectFilter
            title="优先级"
            options={['部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求']}
            selectedValues={priorityFilter}
            onSelectionChange={setPriorityFilter}
          />

          {/* KR筛选 */}
          <MultiSelectFilter
            title="KR"
            options={krOptions}
            selectedValues={selectedKRs}
            onSelectionChange={setSelectedKRs}
          />
        </div>

        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            const newProject = {
              id: Date.now(),
              name: '',
              businessProblem: '',
              status: '未开始' as ProjectStatus,
              priority: '日常需求',
              priorityColor: 'bg-blue-100 text-blue-800',
              thisWeekProgress: '',
              thisWeekIssues: '',
              lastWeekProgress: '',
              lastWeekIssues: '',
              pm: '',
              backend: '',
              frontend: '',
              testing: '',
              proposalDate: '',
              launchDate: '',
              relatedKRs: [],
            };
            setProjects([newProject, ...projects]);
            setTimeout(() => {
              startEditing(newProject.id, 'name', '');
            }, 100);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </Button>
      </div>

      {/* 项目表格 - 使用单一表格避免错行 */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-48">项目名称</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-64">解决的业务问题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-36">优先级</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-56">本周进展</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-56">本周问题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-56">上周进展</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-56">上周问题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-28">产品</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-40">后端</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-28">前端</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-28">测试</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">提出时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">上线时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <tr key={project.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 w-48">
                      <EditableCell
                        projectId={project.id}
                        field="name"
                        value={project.name}
                        className="text-blue-600 font-medium"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-64">
                      <EditableCell
                        projectId={project.id}
                        field="businessProblem"
                        value={project.businessProblem}
                        className="text-gray-700"
                        multiline
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-32">
                      <Badge className={STATUS_COLORS[project.status]}>
                        {project.status}
                      </Badge>
                    </td>
                    
                    <td className="px-4 py-3 w-36">
                      <Badge className={project.priorityColor}>
                        {project.priority}
                      </Badge>
                    </td>
                    
                    <td className="px-4 py-3 w-56">
                      <EditableCell
                        projectId={project.id}
                        field="thisWeekProgress"
                        value={project.thisWeekProgress}
                        className="text-sm text-gray-700"
                        multiline
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-56">
                      <EditableCell
                        projectId={project.id}
                        field="thisWeekIssues"
                        value={project.thisWeekIssues}
                        className="text-sm text-red-600"
                        multiline
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-56">
                      <div className="text-sm text-gray-500 p-1">
                        {project.lastWeekProgress || '暂无记录'}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 w-56">
                      <div className="text-sm text-gray-500 p-1">
                        {project.lastWeekIssues || '暂无记录'}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 w-28">
                      <EditableCell
                        projectId={project.id}
                        field="pm"
                        value={project.pm}
                        className="text-sm text-gray-600"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-40">
                      <EditableCell
                        projectId={project.id}
                        field="backend"
                        value={project.backend}
                        className="text-sm text-gray-600"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-28">
                      <EditableCell
                        projectId={project.id}
                        field="frontend"
                        value={project.frontend}
                        className="text-sm text-gray-600"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-28">
                      <EditableCell
                        projectId={project.id}
                        field="testing"
                        value={project.testing}
                        className="text-sm text-gray-600"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-32">
                      <EditableCell
                        projectId={project.id}
                        field="proposalDate"
                        value={project.proposalDate}
                        className="text-sm text-gray-600"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-32">
                      <EditableCell
                        projectId={project.id}
                        field="launchDate"
                        value={project.launchDate}
                        className="text-sm text-gray-600"
                      />
                    </td>
                    
                    <td className="px-4 py-3 w-24">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            添加评论
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="w-4 h-4 mr-2" />
                            变更记录
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除项目
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="mt-6 text-sm text-gray-500">
        共 {filteredProjects.length} 个项目
        {searchTerm && ` · 搜索"${searchTerm}"`}
        {statusFilter.length > 0 && ` · 状态：${statusFilter.join(', ')}`}
        {priorityFilter.length > 0 && ` · 优先级：${priorityFilter.join(', ')}`}
        {selectedKRs.length > 0 && ` · KR：${selectedKRs.length}个`}
      </div>
    </div>
  );
};

export default ProjectOverview;