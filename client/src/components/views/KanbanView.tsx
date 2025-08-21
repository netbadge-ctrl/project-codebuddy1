import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Project, User, OKRSet } from '../../types';
import { ChevronLeft, ChevronRight, Calendar, Users, Target, FolderOpen } from 'lucide-react';

type ViewMode = 'week' | 'month';

interface FilterState {
  employees: string[];
  projects: string[];
  krs: string[];
}

interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

interface GanttItem {
  userId: string;
  userName: string;
  userAvatar: string;
  projectId: string;
  projectName: string;
  role: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

const KanbanView: React.FC = () => {
  const { projects, users, okrSets } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<FilterState>({
    employees: [],
    projects: [],
    krs: []
  });

  // 项目颜色映射
  const projectColors = [
    '#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B', 
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ];

  // 生成时间槽
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const start = new Date(currentDate);
    
    if (viewMode === 'week') {
      // 显示本周和之后两周
      start.setDate(start.getDate() - start.getDay()); // 周日开始
      for (let i = 0; i < 3; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        slots.push({
          start: weekStart,
          end: weekEnd,
          label: `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
        });
      }
    } else {
      // 显示本月和之后两个月
      start.setDate(1); // 月初
      for (let i = 0; i < 3; i++) {
        const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const monthEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);
        
        slots.push({
          start: monthStart,
          end: monthEnd,
          label: `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月`
        });
      }
    }
    
    return slots;
  }, [currentDate, viewMode]);

  // 生成甘特图数据
  const ganttData = useMemo((): GanttItem[] => {
    const items: GanttItem[] = [];
    const projectColorMap = new Map<string, string>();
    
    projects.forEach((project, projectIndex) => {
      const color = projectColors[projectIndex % projectColors.length];
      projectColorMap.set(project.id, color);
      
      // 处理各个角色的成员
      const allRoles = [
        ...project.productManagers.map(r => ({ ...r, role: '产品' })),
        ...project.backendDevelopers.map(r => ({ ...r, role: '后端' })),
        ...project.frontendDevelopers.map(r => ({ ...r, role: '前端' })),
        ...project.qaTesters.map(r => ({ ...r, role: '测试' }))
      ];
      
      allRoles.forEach(roleAssignment => {
        if (roleAssignment.startDate && roleAssignment.endDate) {
          items.push({
            userId: roleAssignment.userId,
            userName: users.find(u => u.id === roleAssignment.userId)?.name || '',
            userAvatar: users.find(u => u.id === roleAssignment.userId)?.avatarUrl || '',
            projectId: project.id,
            projectName: project.name,
            role: roleAssignment.role,
            startDate: new Date(roleAssignment.startDate),
            endDate: new Date(roleAssignment.endDate),
            color
          });
        }
      });
    });
    
    return items;
  }, [projects, users]);

  // 应用筛选
  const filteredData = useMemo(() => {
    return ganttData.filter(item => {
      if (filters.employees.length > 0 && !filters.employees.includes(item.userId)) {
        return false;
      }
      if (filters.projects.length > 0 && !filters.projects.includes(item.projectId)) {
        return false;
      }
      if (filters.krs.length > 0) {
        const project = projects.find(p => p.id === item.projectId);
        if (!project || !project.keyResultIds.some(krId => filters.krs.includes(krId))) {
          return false;
        }
      }
      return true;
    });
  }, [ganttData, filters, projects]);

  // 按用户分组
  const groupedData = useMemo(() => {
    const groups = new Map<string, GanttItem[]>();
    filteredData.forEach(item => {
      if (!groups.has(item.userId)) {
        groups.set(item.userId, []);
      }
      groups.get(item.userId)!.push(item);
    });
    return groups;
  }, [filteredData]);

  // 计算甘特条的位置和宽度
  const calculateBarStyle = (item: GanttItem, timeSlots: TimeSlot[]) => {
    const totalStart = timeSlots[0].start.getTime();
    const totalEnd = timeSlots[timeSlots.length - 1].end.getTime();
    const totalDuration = totalEnd - totalStart;
    
    const itemStart = Math.max(item.startDate.getTime(), totalStart);
    const itemEnd = Math.min(item.endDate.getTime(), totalEnd);
    
    if (itemEnd <= itemStart) return { display: 'none' };
    
    const left = ((itemStart - totalStart) / totalDuration) * 100;
    const width = ((itemEnd - itemStart) / totalDuration) * 100;
    
    return {
      left: `${left}%`,
      width: `${width}%`,
      backgroundColor: item.color,
      opacity: 0.8
    };
  };

  // 导航函数
  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // 获取所有KR选项
  const allKRs = useMemo(() => {
    const krs: { id: string; label: string }[] = [];
    okrSets.forEach(set => {
      set.okrs.forEach(okr => {
        okr.keyResults.forEach(kr => {
          krs.push({
            id: kr.id,
            label: `${okr.objective} - ${kr.description}`
          });
        });
      });
    });
    return krs;
  }, [okrSets]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* 员工筛选 */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select 
              multiple
              className="border rounded px-3 py-1 text-sm min-w-[120px]"
              value={filters.employees}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                employees: Array.from(e.target.selectedOptions, option => option.value)
              }))}
            >
              <option value="">按员工筛选</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* 项目筛选 */}
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-500" />
            <select 
              multiple
              className="border rounded px-3 py-1 text-sm min-w-[120px]"
              value={filters.projects}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                projects: Array.from(e.target.selectedOptions, option => option.value)
              }))}
            >
              <option value="">按项目筛选</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* KR筛选 */}
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <select 
              multiple
              className="border rounded px-3 py-1 text-sm min-w-[120px]"
              value={filters.krs}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                krs: Array.from(e.target.selectedOptions, option => option.value)
              }))}
            >
              <option value="">按KR筛选</option>
              {allKRs.map(kr => (
                <option key={kr.id} value={kr.id}>{kr.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 视图控制 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 视图模式切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                周
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                月
              </button>
            </div>
          </div>

          {/* 时间导航 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTime('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5" />
              {timeSlots.length > 0 && (
                <span>
                  {viewMode === 'month' 
                    ? `${timeSlots[0].start.getFullYear()}年${timeSlots[0].start.getMonth() + 1}月 - ${timeSlots[2].start.getFullYear()}年${timeSlots[2].start.getMonth() + 1}月`
                    : timeSlots.map(slot => slot.label).join(' | ')
                  }
                </span>
              )}
            </div>
            
            <button
              onClick={() => navigateTime('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 甘特图 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 时间轴头部 */}
        <div className="flex border-b bg-gray-50">
          <div className="w-48 p-4 border-r bg-white">
            <span className="font-medium text-gray-900">团队成员</span>
          </div>
          <div className="flex-1 flex">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex-1 p-4 border-r last:border-r-0 text-center">
                <div className="font-medium text-gray-900">{slot.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 甘特图内容 */}
        <div className="divide-y">
          {Array.from(groupedData.entries()).map(([userId, userItems]) => {
            const user = users.find(u => u.id === userId);
            if (!user) return null;

            return (
              <div key={userId} className="flex hover:bg-gray-50">
                {/* 用户信息 */}
                <div className="w-48 p-4 border-r bg-white flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>

                {/* 甘特条区域 */}
                <div className="flex-1 relative" style={{ minHeight: '60px' }}>
                  {/* 时间槽背景 */}
                  <div className="absolute inset-0 flex">
                    {timeSlots.map((_, index) => (
                      <div key={index} className="flex-1 border-r last:border-r-0 border-gray-200" />
                    ))}
                  </div>

                  {/* 甘特条 */}
                  {userItems.map((item, index) => {
                    const style = calculateBarStyle(item, timeSlots);
                    if (style.display === 'none') return null;

                    return (
                      <div
                        key={`${item.projectId}-${index}`}
                        className="absolute rounded px-2 py-1 text-xs text-white font-medium shadow-sm cursor-pointer hover:opacity-100 transition-opacity"
                        style={{
                          ...style,
                          top: `${index * 20 + 10}px`,
                          height: '18px',
                          zIndex: 10
                        }}
                        title={`${item.projectName} (${item.role})\n${item.startDate.toLocaleDateString()} - ${item.endDate.toLocaleDateString()}`}
                      >
                        <span className="truncate block">
                          {item.projectName} ({item.role})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {groupedData.size === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">暂无排期数据</p>
            <p className="text-sm">请检查筛选条件或项目成员排期设置</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanView;