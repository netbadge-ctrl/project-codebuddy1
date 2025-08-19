import React, { useMemo, useState, useCallback } from 'react';
import { Project, User, OKR } from '../types';
import { KanbanFilterBar } from './KanbanFilterBar';
import { KanbanTimelineControls } from './KanbanTimelineControls';

// --- Date Helper Functions ---

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const getStartOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addWeeks = (date: Date, weeks: number) => {
  return addDays(date, weeks * 7);
};

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}

const diffDays = (date1: Date, date2: Date) => {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// --- Component ---

interface KanbanViewProps {
  projects: Project[];
  allUsers: User[];
  allOkrs: OKR[];
}

const projectColors = [
  'bg-indigo-500', 'bg-rose-500', 'bg-amber-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-fuchsia-500',
  'bg-lime-500', 'bg-sky-500'
];

export const KanbanView: React.FC<KanbanViewProps> = ({ projects, allUsers, allOkrs }) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedKrIds, setSelectedKrIds] = useState<string[]>([]);
  
  const [granularity, setGranularity] = useState<'week' | 'month'>('month');
  const [viewDate, setViewDate] = useState(new Date());


  const timeline = useMemo(() => {
    const headers: { label: string, days: number }[] = [];
    let startDate: Date, endDate: Date, rangeLabel: string;

    if (granularity === 'month') {
        const numMonths = 3;
        startDate = getStartOfMonth(viewDate);
        endDate = addDays(addMonths(startDate, numMonths), -1);

        const monthHeaders: Date[] = [];
        for (let i = 0; i < numMonths; i++) {
            const monthStart = addMonths(startDate, i);
            monthHeaders.push(monthStart);
            const nextMonthStart = addMonths(monthStart, 1);
            headers.push({
                label: `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月`,
                days: diffDays(monthStart, nextMonthStart)
            });
        }
        
        const endMonth = monthHeaders[numMonths-1];
        rangeLabel = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月 - ${endMonth.getFullYear()}年${endMonth.getMonth() + 1}月`;
    } else { // week
        const numWeeks = 3;
        startDate = getStartOfWeek(viewDate);
        endDate = addDays(addWeeks(startDate, numWeeks), -1);

        const formatDate = (d: Date) => `${d.getMonth()+1}月${d.getDate()}日`;
        
        for (let i = 0; i < numWeeks; i++) {
            const weekStart = addWeeks(startDate, i);
            headers.push({
                label: `W${getWeekNumber(weekStart)} (${formatDate(weekStart)})`,
                days: 7
            });
        }
        
        const endWeek = addWeeks(startDate, numWeeks - 1);
        rangeLabel = `${formatDate(startDate)} - ${formatDate(addDays(endWeek, 6))}`;
    }

    const totalDays = diffDays(startDate, endDate) + 1;

    return { startDate, endDate, totalDays, headers, rangeLabel };
  }, [granularity, viewDate]);

  const handleGranularityChange = useCallback((newGranularity: 'week' | 'month') => {
    setGranularity(newGranularity);
    setViewDate(new Date());
  }, []);

  const handlePrev = useCallback(() => {
    const newDate = granularity === 'month' ? addMonths(viewDate, -1) : addWeeks(viewDate, -1);
    setViewDate(newDate);
  }, [granularity, viewDate]);

  const handleNext = useCallback(() => {
    const newDate = granularity === 'month' ? addMonths(viewDate, 1) : addWeeks(viewDate, 1);
    setViewDate(newDate);
  }, [granularity, viewDate]);


  const userSchedules = useMemo(() => {
    let filteredProjects = projects;
    if (selectedKrIds.length > 0) {
        const krSet = new Set(selectedKrIds);
        filteredProjects = filteredProjects.filter(p => p.keyResultIds.some(krId => krSet.has(krId)));
    }
    if (selectedProjectIds.length > 0) {
        const projectSet = new Set(selectedProjectIds);
        filteredProjects = filteredProjects.filter(p => projectSet.has(p.id));
    }
    const relevantProjects = filteredProjects;

    let filteredUsers = allUsers;
    if (selectedUserIds.length > 0) {
        const userSet = new Set(selectedUserIds);
        filteredUsers = filteredUsers.filter(u => userSet.has(u.id));
    }
    
    if (selectedProjectIds.length > 0 || selectedKrIds.length > 0) {
        const assignedUserIds = new Set<string>();
        relevantProjects.forEach(p => {
            const roles: (keyof Project)[] = ['productManagers', 'backendDevelopers', 'frontendDevelopers', 'qaTesters'];
            roles.forEach(roleKey => {
                const team = p[roleKey] as { userId: string }[];
                team.forEach(member => assignedUserIds.add(member.userId));
            });
        });
        filteredUsers = filteredUsers.filter(u => assignedUserIds.has(u.id));
    }
    
    const relevantUsers = filteredUsers;

    return relevantUsers.map(user => {
      const assignedProjects: { project: Project, role: string, startDate: string, endDate: string }[] = [];
      relevantProjects.forEach(p => {
        const roles: (keyof Project)[] = ['productManagers', 'backendDevelopers', 'frontendDevelopers', 'qaTesters'];
        const roleNames: Record<string, string> = { productManagers: '产品', backendDevelopers: '后端', frontendDevelopers: '前端', qaTesters: '测试' };
        roles.forEach(roleKey => {
            const team = p[roleKey] as { userId: string, startDate: string, endDate: string }[];
            const member = team.find(m => m.userId === user.id);
            if (member && member.startDate && member.endDate) {
              assignedProjects.push({ project: p, role: roleNames[roleKey], startDate: member.startDate, endDate: member.endDate });
            }
        });
      });

      const sortedSchedule = assignedProjects.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      const lanes: { endDate: Date }[] = [];
      const scheduleWithLanes = sortedSchedule.map(item => {
          const itemStartDate = new Date(item.startDate);
          let assignedLane = -1;

          for (let i = 0; i < lanes.length; i++) {
              if (itemStartDate > lanes[i].endDate) {
                  assignedLane = i;
                  lanes[i].endDate = new Date(item.endDate);
                  break;
              }
          }

          if (assignedLane === -1) {
              assignedLane = lanes.length;
              lanes.push({ endDate: new Date(item.endDate) });
          }
          
          return { ...item, lane: assignedLane };
      });
      
      return { ...user, schedule: scheduleWithLanes, maxLanes: lanes.length };
    });
  }, [projects, allUsers, selectedUserIds, selectedProjectIds, selectedKrIds]);


  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
        <KanbanFilterBar
            allUsers={allUsers}
            allProjects={projects}
            allOkrs={allOkrs}
            selectedUsers={selectedUserIds}
            setSelectedUsers={setSelectedUserIds}
            selectedProjects={selectedProjectIds}
            setSelectedProjects={setSelectedProjectIds}
            selectedKrs={selectedKrIds}
            setSelectedKrs={setSelectedKrIds}
        />
        <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl flex-grow overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-[#232323] z-20">
              <KanbanTimelineControls 
                granularity={granularity}
                onGranularityChange={handleGranularityChange}
                onPrev={handlePrev}
                onNext={handleNext}
                rangeLabel={timeline.rangeLabel}
              />
              <div className="flex bg-gray-100 dark:bg-[#2a2a2a]">
                <div className="w-48 flex-shrink-0 p-3 font-semibold text-sm text-gray-900 dark:text-white border-r border-t border-gray-200 dark:border-[#363636]">
                  团队成员
                </div>
                <div className="flex-grow flex">
                  {timeline.headers.map((header, idx) => (
                    <div key={idx} style={{ width: `${(header.days / timeline.totalDays) * 100}%` }} className="p-3 text-center font-semibold text-sm text-gray-900 dark:text-white border-r border-t border-gray-200 dark:border-[#363636]">
                      {header.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="relative">
              {userSchedules.map((user) => (
                <div key={user.id} className="relative flex border-t border-gray-200 dark:border-[#363636] group hover:z-20">
                  <div className="w-48 flex-shrink-0 p-3 text-sm flex items-center border-r border-gray-200 dark:border-[#363636] bg-white dark:bg-[#232323] group-hover:bg-gray-50 dark:group-hover:bg-[#2a2a2a] transition-colors duration-200">
                     <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full mr-2"/>
                     <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                  <div className="flex-grow relative group-hover:bg-gray-50 dark:group-hover:bg-[#2a2a2a] transition-colors duration-200" style={{ minHeight: `${(user.maxLanes || 1) * 2.5}rem`}}>
                    {/* Background grid lines for headers */}
                    <div className="absolute inset-0 flex">
                      {timeline.headers.map((header, idx) => (
                        <div key={`grid-${idx}`} style={{ width: `${(header.days / timeline.totalDays) * 100}%` }} className="h-full border-r border-gray-200/70 dark:border-[#363636]/50"></div>
                      ))}
                    </div>

                    {/* Schedule Bars */}
                    <div className="absolute inset-0 py-1 z-10">
                      {user.schedule.map((item) => {
                        const itemStartDate = new Date(item.startDate);
                        const itemEndDate = new Date(item.endDate);

                        if (itemStartDate > timeline.endDate || itemEndDate < timeline.startDate) return null;

                        const clampedStartDate = itemStartDate < timeline.startDate ? timeline.startDate : itemStartDate;
                        const clampedEndDate = itemEndDate > timeline.endDate ? timeline.endDate : itemEndDate;
                        
                        const startOffsetDays = diffDays(timeline.startDate, clampedStartDate);
                        const durationDays = diffDays(clampedStartDate, clampedEndDate) + 1;

                        const left = (startOffsetDays / timeline.totalDays) * 100;
                        const width = (durationDays / timeline.totalDays) * 100;
                        const color = projectColors[(item.project.id.charCodeAt(1) || 0) % projectColors.length];

                        return (
                          <div
                            key={`${item.project.id}-${item.lane}`}
                            className={`absolute rounded-md ${color} px-2 flex items-center text-xs font-semibold text-white/90 tooltip-container group/item`}
                            style={{
                              left: `${left}%`,
                              width: `${width > 0 ? width : 0}%`,
                              minWidth: '1px',
                              top: `${item.lane * 2.5}rem`,
                              height: '2rem'
                            }}
                          >
                            <span className="truncate">{item.project.name} ({item.role})</span>
                            <div className="tooltip bg-gray-900 text-white text-xs rounded py-1 px-2 absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none transition-opacity z-50 whitespace-nowrap group-hover/item:opacity-100">
                              {item.project.name}: {item.startDate} ~ {item.endDate}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};