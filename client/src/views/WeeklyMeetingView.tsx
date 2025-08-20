import React, { useContext, useMemo } from 'react';
import { DataContext } from '../contexts/DataContext';
import { Project, User } from '../types';
import { getPriorityColor } from '../utils/style';
import { format } from 'date-fns';

const RoleDisplay: React.FC<{ users: User[], roles: { userId: string }[] | undefined, label: string }> = ({ users, roles, label }) => {
  if (!roles || roles.length === 0) return null;

  const userNames = roles
    .map(r => users.find(u => u.id === r.userId)?.name)
    .filter(Boolean)
    .join(', ');

  if (!userNames) return null;

  return (
    <div className="text-sm">
      <span className="font-semibold text-gray-600">{label}: </span>
      <span className="text-gray-800">{userNames}</span>
    </div>
  );
};

const ProjectMeetingCard: React.FC<{ project: Project, users: User[] }> = ({ project, users }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 break-inside-avoid">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
          {project.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4">
        <RoleDisplay users={users} roles={project.productManagers} label="产品" />
        <RoleDisplay users={users} roles={project.backendDevelopers} label="后端" />
        <RoleDisplay users={users} roles={project.frontendDevelopers} label="前端" />
        <RoleDisplay users={users} roles={project.qaTesters} label="测试" />
        {project.launchDate && (
           <div className="text-sm">
             <span className="font-semibold text-gray-600">上线日期: </span>
             <span className="text-gray-800">{format(new Date(project.launchDate), 'yyyy-MM-dd')}</span>
           </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">上周进展</h3>
          {project.lastWeekUpdate ? (
            <p className="text-gray-600 whitespace-pre-wrap">{project.lastWeekUpdate}</p>
          ) : (
            <p className="text-gray-400 italic">无</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">本周计划</h3>
           {project.weeklyUpdate ? (
            <p className="text-gray-600 whitespace-pre-wrap">{project.weeklyUpdate}</p>
          ) : (
            <p className="text-gray-400 italic">无</p>
          )}
        </div>
      </div>
    </div>
  );
};


export const WeeklyMeetingView: React.FC = () => {
  const { projects, users, loading } = useContext(DataContext);

  const activeProjects = useMemo(() => {
    return projects
      .filter(p => p.status !== '已上线')
      .sort((a, b) => {
        const priorityOrder = ['部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求'];
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      });
  }, [projects]);

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="h-full bg-gray-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">周会进展同步</h1>
            <p className="text-gray-500 mt-2">{format(new Date(), 'yyyy年M月d日')} - 共 {activeProjects.length} 个进行中项目</p>
        </div>
        
        <div className="column-count-1 md:column-count-2 lg:column-count-3 column-gap-6">
          {activeProjects.map(project => (
            <ProjectMeetingCard key={project.id} project={project} users={users} />
          ))}
        </div>

        {activeProjects.length === 0 && (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-gray-700">所有项目都已上线！🎉</h2>
                <p className="text-gray-500 mt-2">当前没有正在进行中的项目。</p>
            </div>
        )}
      </div>
    </div>
  );
};