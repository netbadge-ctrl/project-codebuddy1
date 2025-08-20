import React, { useState, useMemo, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  parseISO,
  differenceInDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DataContext } from '../contexts/DataContext';
import { getProjectColor } from '../utils/style';
import { Role, Project } from '../types';

type ViewMode = 'month' | 'week';

interface ScheduleEvent {
  userId: string;
  projectId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

export const KanbanView: React.FC = () => {
  const { projects, users, loading } = useContext(DataContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const timeline = useMemo(() => {
    const start = viewMode === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = viewMode === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate, { weekStartsOn: 1 });
    return { start, end, days: eachDayOfInterval({ start, end }) };
  }, [currentDate, viewMode]);

  const scheduleEvents = useMemo<ScheduleEvent[]>(() => {
    if (!projects) return [];
    const events: ScheduleEvent[] = [];
    projects.forEach((project: Project) => {
      const roles: Role[] = [
        ...(project.productManagers || []),
        ...(project.backendDevelopers || []),
        ...(project.frontendDevelopers || []),
        ...(project.qaTesters || []),
      ];

      roles.forEach((role) => {
        if (role.startDate && role.endDate && role.userId) {
          events.push({
            userId: role.userId,
            projectId: project.id,
            projectName: project.name,
            startDate: parseISO(role.startDate),
            endDate: parseISO(role.endDate),
            color: getProjectColor(project.id),
          });
        }
      });
    });
    return events;
  }, [projects]);

  const usersWithEvents = useMemo(() => {
    const userIdsInEvents = new Set(scheduleEvents.map(e => e.userId));
    return users.filter(u => userIdsInEvents.has(u.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [scheduleEvents, users]);


  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold text-gray-800">资源看板</span>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button onClick={handlePrev} className="p-2 border-r border-gray-300 hover:bg-gray-100 rounded-l-md">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleToday} className="px-4 py-2 border-r border-gray-300 hover:bg-gray-100">
              今天
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-r-md">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-lg font-semibold text-gray-600">
            {format(currentDate, 'yyyy年 MMMM', { locale: zhCN })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-200 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'month' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'week' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              周
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-grow overflow-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `200px repeat(${timeline.days.length}, minmax(40px, 1fr))`,
            gridTemplateRows: `auto repeat(${usersWithEvents.length}, 40px)`,
          }}
        >
          {/* Header */}
          <div style={{ gridColumn: '1', gridRow: '1' }} className="sticky top-0 z-20 p-2 border-r border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 flex items-center">成员</div>
          {timeline.days.map((day, index) => (
            <div key={index} style={{ gridColumn: `${index + 2}`, gridRow: '1' }} className="sticky top-0 z-20 border-r border-b border-gray-200 bg-gray-100 text-center py-1">
              <div className={`text-xs ${isSameMonth(day, currentDate) ? 'text-gray-500' : 'text-gray-400'}`}>
                {weekDays[day.getDay() === 0 ? 6 : day.getDay() - 1]}
              </div>
              <div className={`mt-1 text-sm font-medium ${isToday(day) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : isSameMonth(day, currentDate) ? 'text-gray-800' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}

          {/* User Names & Grid Background */}
          {usersWithEvents.map((user, userIndex) => (
            <React.Fragment key={user.id}>
              <div style={{ gridColumn: '1', gridRow: `${userIndex + 2}` }} className="sticky left-0 z-10 flex items-center p-2 border-r border-b border-gray-200 bg-white">
                <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full mr-2" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              {timeline.days.map((_, dayIndex) => (
                <div key={dayIndex} style={{ gridColumn: `${dayIndex + 2}`, gridRow: `${userIndex + 2}` }} className="border-r border-b border-gray-200" />
              ))}
            </React.Fragment>
          ))}
          
          {/* Event Bars */}
          {scheduleEvents.map((event, eventIndex) => {
            const userIndex = usersWithEvents.findIndex(u => u.id === event.userId);
            if (userIndex === -1) return null;

            const startOffset = differenceInDays(event.startDate, timeline.start);
            const duration = differenceInDays(event.endDate, event.startDate) + 1;

            if (startOffset + duration <= 0 || startOffset >= timeline.days.length) {
              return null;
            }

            const gridColumnStart = Math.max(startOffset, 0) + 2;
            const gridColumnEnd = Math.min(startOffset + duration, timeline.days.length) + 2;
            const gridRow = userIndex + 2;

            return (
              <div
                key={`${event.projectId}-${event.userId}-${eventIndex}`}
                className="h-6 m-auto rounded flex items-center px-2 overflow-hidden z-10 cursor-pointer hover:opacity-80"
                style={{
                  gridColumn: `${gridColumnStart} / span ${gridColumnEnd - gridColumnStart}`,
                  gridRow: `${gridRow}`,
                  backgroundColor: event.color,
                }}
                title={`${event.projectName}\n${format(event.startDate, 'yyyy/MM/dd')} - ${format(event.endDate, 'yyyy/MM/dd')}`}
              >
                <span className="text-white text-xs font-medium truncate">{event.projectName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};