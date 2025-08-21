import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Eye, MessageCircle, History, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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

  // 项目数据 - 使用新的状态定义
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Q3 用户增长计划',
      businessProblem: '用户增长缓慢，需要提升获客效率和用户留存率',
      status: '开发中' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      pm: '张三',
      backend: '李四, 赵六',
      frontend: '孙七',
      testing: '陈十一',
      proposalDate: '2025-06-21',
      launchDate: '2025-09-19',
      followers: 5,
      comments: 12,
      relatedKRs: ['kr1_1', 'kr1_2'],
    },
    {
      id: 2,
      name: '数据中台建设',
      businessProblem: '数据分散在各个系统中，缺乏统一的数据管理和分析平台',
      status: '测试中' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      pm: '李四',
      backend: '张三, 周八',
      frontend: '李四',
      testing: '赵六',
      proposalDate: '2025-04-22',
      launchDate: '2025-09-09',
      followers: 8,
      comments: 23,
      relatedKRs: ['kr2_1'],
    },
    {
      id: 3,
      name: '管理后台 V2.0',
      businessProblem: '现有后台操作复杂，运营效率低下，需要重新设计用户体验',
      status: '需求讨论' as ProjectStatus,
      priority: '个人OKR相关',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      pm: '王五, 张三',
      backend: '赵六',
      frontend: '孙七',
      testing: '卫十二',
      proposalDate: '2025-07-11',
      launchDate: '2025-10-09',
      followers: 3,
      comments: 8,
      relatedKRs: ['kr3_1', 'kr3_2'],
    },
    {
      id: 4,
      name: 'AI智能客服机器人',
      businessProblem: '客服人力成本高，响应速度慢，需要AI辅助提升服务效率',
      status: '开发中' as ProjectStatus,
      priority: '临时重要需求',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      pm: '王五',
      backend: '周八',
      frontend: '孙七',
      testing: '卫十二',
      proposalDate: '2025-07-11',
      launchDate: '2025-10-09',
      followers: 6,
      comments: 15,
      relatedKRs: ['kr3_1'],
    },
    {
      id: 5,
      name: '官网2024版改版',
      businessProblem: '官网设计过时，用户体验差，影响品牌形象和转化率',
      status: '待测试' as ProjectStatus,
      priority: '日常需求',
      priorityColor: 'bg-blue-100 text-blue-800',
      pm: '张三',
      backend: '周八',
      frontend: '孙七',
      testing: '陈十一',
      proposalDate: '2025-07-01',
      launchDate: '2025-08-30',
      followers: 4,
      comments: 7,
      relatedKRs: ['kr1_2'],
    },
    {
      id: 6,
      name: '支付系统重构',
      businessProblem: '支付成功率低，用户投诉多，需要重构提升稳定性',
      status: '已上线' as ProjectStatus,
      priority: '部门OKR相关',
      priorityColor: 'bg-red-100 text-red-800',
      pm: '李四',
      backend: '赵六',
      frontend: '孙七',
      testing: '陈十一',
      proposalDate: '2025-04-22',
      launchDate: '2025-08-15',
      followers: 7,
      comments: 18,
      relatedKRs: ['kr2_1', 'kr2_2'],
    },
  ]);

  // 编辑状态管理
  const [editingCell, setEditingCell] = useState<{projectId: number, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // 模拟保存到数据库的函数
  const saveToDatabase = async (projectId: number, field: string, value: string) => {
    // 这里应该调用实际的API
    console.log(`保存项目 ${projectId} 的 ${field} 字段为: ${value}`);
    // 模拟API调用延迟
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
    
    // 更新本地状态
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, [field]: editingValue }
        : project
    ));

    // 保存到数据库
    await saveToDatabase(projectId, field, editingValue);
    
    // 清除编辑状态
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

  // 多选筛选器组件
  const MultiSelectFilter = ({ 
    title, 
    options, 
    selectedValues, 
    onSelectionChange 
  }: {
    title: string;
    options: { [key: string]: { objective: string; keyResults: { value: string; label: string }[] } };
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
  }) => {
    // 计算所有可选值
    const getAllValues = () => {
      const allKRs: string[] = [];
      Object.values(options).forEach(group => {
        group.keyResults.forEach(kr => {
          allKRs.push(kr.value);
        });
      });
      return allKRs;
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
              {Object.entries(options).map(([okrId, group]) => (
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
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // 筛选项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 简化的控制区 */}
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="项目状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {PROJECT_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 优先级筛选 */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部优先级</SelectItem>
              <SelectItem value="部门OKR相关">部门OKR相关</SelectItem>
              <SelectItem value="个人OKR相关">个人OKR相关</SelectItem>
              <SelectItem value="临时重要需求">临时重要需求</SelectItem>
              <SelectItem value="日常需求">日常需求</SelectItem>
            </SelectContent>
          </Select>

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
              pm: '',
              backend: '',
              frontend: '',
              testing: '',
              proposalDate: '',
              launchDate: '',
              followers: 0,
              comments: 0,
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

      {/* 项目表格 */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-48">项目名称</TableHead>
                <TableHead className="w-64">解决的业务问题</TableHead>
                <TableHead className="w-32">状态</TableHead>
                <TableHead className="w-32">优先级</TableHead>
                <TableHead className="w-24">产品</TableHead>
                <TableHead className="w-32">后端</TableHead>
                <TableHead className="w-24">前端</TableHead>
                <TableHead className="w-24">测试</TableHead>
                <TableHead className="w-28">提出时间</TableHead>
                <TableHead className="w-28">上线时间</TableHead>
                <TableHead className="w-20 text-center">关注</TableHead>
                <TableHead className="w-20 text-center">评论</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-gray-50">
                  {/* 项目名称 */}
                  <TableCell className="w-48 font-medium">
                    <EditableCell
                      projectId={project.id}
                      field="name"
                      value={project.name}
                      className="text-blue-600 font-medium"
                    />
                  </TableCell>
                  
                  {/* 解决的业务问题 */}
                  <TableCell className="w-64">
                    <EditableCell
                      projectId={project.id}
                      field="businessProblem"
                      value={project.businessProblem}
                      className="text-gray-700"
                      multiline
                    />
                  </TableCell>
                  
                  {/* 状态 */}
                  <TableCell className="w-32">
                    <Badge className={STATUS_COLORS[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  
                  {/* 优先级 */}
                  <TableCell className="w-32">
                    <Badge className={project.priorityColor}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  
                  {/* 产品 */}
                  <TableCell className="w-24">
                    <EditableCell
                      projectId={project.id}
                      field="pm"
                      value={project.pm}
                      className="text-sm text-gray-600"
                    />
                  </TableCell>
                  
                  {/* 后端 */}
                  <TableCell className="w-32">
                    <EditableCell
                      projectId={project.id}
                      field="backend"
                      value={project.backend}
                      className="text-sm text-gray-600"
                    />
                  </TableCell>
                  
                  {/* 前端 */}
                  <TableCell className="w-24">
                    <EditableCell
                      projectId={project.id}
                      field="frontend"
                      value={project.frontend}
                      className="text-sm text-gray-600"
                    />
                  </TableCell>
                  
                  {/* 测试 */}
                  <TableCell className="w-24">
                    <EditableCell
                      projectId={project.id}
                      field="testing"
                      value={project.testing}
                      className="text-sm text-gray-600"
                    />
                  </TableCell>
                  
                  {/* 提出时间 */}
                  <TableCell className="w-28">
                    <EditableCell
                      projectId={project.id}
                      field="proposalDate"
                      value={project.proposalDate}
                      className="text-sm text-gray-600"
                    />
                  </TableCell>
                  
                  {/* 上线时间 */}
                  <TableCell className="w-28">
                    <EditableCell
                      projectId={project.id}
                      field="launchDate"
                      value={project.launchDate}
                      className="text-sm text-gray-600"
                    />
                  </TableCell>
                  
                  {/* 关注 */}
                  <TableCell className="w-20 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{project.followers}</span>
                    </div>
                  </TableCell>
                  
                  {/* 评论 */}
                  <TableCell className="w-20 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{project.comments}</span>
                    </div>
                  </TableCell>
                  
                  {/* 操作 */}
                  <TableCell className="w-20">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="mt-6 text-sm text-gray-500">
        共 {filteredProjects.length} 个项目
        {searchTerm && ` · 搜索"${searchTerm}"`}
        {statusFilter !== 'all' && ` · 状态：${statusFilter}`}
        {priorityFilter !== 'all' && ` · 优先级：${priorityFilter}`}
      </div>
    </div>
  );
};

export default ProjectOverview;