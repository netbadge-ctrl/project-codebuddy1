import React from 'react';
import { Project, User, Priority, ProjectStatus } from '../types';

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const priorityStyles: Record<Priority, string> = {
        [Priority.P0]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600/70 dark:text-red-200 dark:border-red-500/80',
        [Priority.P1]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/70 dark:text-orange-200 dark:border-orange-500/80',
        [Priority.P2]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/70 dark:text-yellow-200 dark:border-yellow-500/80',
        [Priority.P3]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600/70 dark:text-gray-200 dark:border-gray-500/80',
    }
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${priorityStyles[priority]}`}>
        {priority}
      </span>
    );
};

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const statusStyles: Record<ProjectStatus, string> = {
    [ProjectStatus.NotStarted]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600/50 dark:text-gray-300 dark:border-gray-500/60',
    [ProjectStatus.Discussion]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-600/50 dark:text-purple-300 dark:border-purple-500/60',
    [ProjectStatus.RequirementsDone]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-600/50 dark:text-blue-300 dark:border-blue-500/60',
    [ProjectStatus.ReviewDone]: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-600/50 dark:text-cyan-300 dark:border-cyan-500/60',
    [ProjectStatus.InProgress]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/50 dark:text-orange-300 dark:border-orange-500/60',
    [ProjectStatus.DevDone]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/50 dark:text-yellow-300 dark:border-yellow-500/60',
    [ProjectStatus.Testing]: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-600/50 dark:text-pink-300 dark:border-pink-500/60',
    [ProjectStatus.TestDone]: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-600/50 dark:text-teal-300 dark:border-teal-500/60',
    [ProjectStatus.Launched]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-600/50 dark:text-green-300 dark:border-green-500/60',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

interface ProjectCardProps {
  project: Project;
  allUsers: User[];
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, allUsers, onClick }) => {
  const pmNames = project.productManagers
    .map(m => allUsers.find(u => u.id === m.userId)?.name)
    .filter(Boolean)
    .join(', ');

  const cardClasses = "bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl p-4 flex flex-col gap-3 hover:border-[#6C63FF] transition-all duration-300";
  const clickableClasses = onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10" : "";

  return (
    <div className={`${cardClasses} ${clickableClasses}`} onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white pr-2 flex-grow">{project.name}</h3>
        <div className="flex-shrink-0">
          <PriorityBadge priority={project.priority} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={project.status} />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1.5">
        <div className="flex justify-between">
          <span>产品经理:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{pmNames || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>提出时间:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{project.proposalDate || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>上线时间:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{project.launchDate || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};