import React from 'react';
import { Project, User, Priority, ProjectStatus, OKR, Role, ProjectRoleKey } from '../types';
import { IconMessageCircle } from './Icons';

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

interface WeeklyMeetingProjectCardProps {
    project: Project;
    allUsers: User[];
    allOkrs: OKR[];
    onOpenCommentModal: () => void;
}

const UpdateDisplay: React.FC<{html: string, title: string}> = ({html, title}) => (
    <div>
        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</h4>
        <div
            className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg min-h-[120px] max-h-56 overflow-y-auto text-sm text-gray-800 dark:text-gray-300 weekly-update-content"
            dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400 dark:text-gray-500 italic">无</p>' }}
        />
        {/* Basic styling for contenteditable output */}
        <style>{`
          .weekly-update-content b { font-weight: 600; }
          .weekly-update-content font[color="#ef4444"] { color: #ef4444; }
        `}</style>
    </div>
);

const RoleDisplay: React.FC<{ team: Role; allUsers: User[], name: string }> = ({ team, allUsers, name }) => {
    return (
        <div className="flex justify-between items-start text-sm py-1">
            <h5 className="font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 pr-4">{name}</h5>
            <div className="text-right">
                {team.length === 0 ? (
                    <span className="text-gray-400 dark:text-gray-500 italic">暂无</span>
                ) : (
                    <ul className="space-y-1">
                        {team.map(member => {
                            const user = allUsers.find(u => u.id === member.userId);
                            const scheduleText = (member.startDate && member.endDate)
                                ? `${member.startDate.replace(/-/g, '.')} - ${member.endDate.replace(/-/g, '.')}`
                                : <span className="text-gray-500 dark:text-gray-400 italic">暂无排期</span>;
                            
                            return (
                                <li key={member.userId} className="grid grid-cols-[1fr_auto] items-baseline gap-x-2">
                                    <span className="text-gray-700 dark:text-gray-200 text-right">{user?.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{scheduleText}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export const WeeklyMeetingProjectCard: React.FC<WeeklyMeetingProjectCardProps> = ({ project, allUsers, allOkrs, onOpenCommentModal }) => {
    const productManagers = project.productManagers.map(m => allUsers.find(u => u.id === m.userId)?.name).filter(Boolean).join(', ');

    const projectOkrs = allOkrs.filter(okr => 
        okr.keyResults.some(kr => project.keyResultIds.includes(kr.id))
    );

    const roleInfo: { key: ProjectRoleKey, name: string }[] = [
        { key: 'productManagers', name: '产品' },
        { key: 'backendDevelopers', name: '后端' },
        { key: 'frontendDevelopers', name: '前端' },
        { key: 'qaTesters', name: '测试' },
    ];

    return (
        <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#363636]">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.name}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <PriorityBadge priority={project.priority} />
                        <StatusBadge status={project.status} />
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PM: {productManagers || 'N/A'}</p>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-6 flex-grow">
                 {/* Business Problem Section */}
                 <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">解决的业务问题</h4>
                    <div className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg text-sm text-gray-800 dark:text-gray-300">
                        <p className="whitespace-pre-wrap">{project.businessProblem || <span className="text-gray-400 dark:text-gray-500 italic">无</span>}</p>
                    </div>
                </div>
                 
                 {/* OKR Section */}
                 <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">关联 OKR</h4>
                    <div className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg text-xs space-y-2">
                        {projectOkrs.length > 0 ? (
                            projectOkrs.map(okr => (
                                <div key={okr.id}>
                                    <strong className="text-gray-600 dark:text-gray-300 block">O: {okr.objective}</strong>
                                    <ul className="pl-3 list-disc list-inside">
                                        {okr.keyResults.filter(kr => project.keyResultIds.includes(kr.id)).map(kr => (
                                            <li key={kr.id} className="text-gray-700 dark:text-gray-400">KR: {kr.description}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 dark:text-gray-500 italic">未关联</p>
                        )}
                    </div>
                </div>

                {/* Team Section */}
                <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">团队角色与排期</h4>
                    <div className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg divide-y divide-gray-200 dark:divide-gray-600/50">
                        {roleInfo.map(({ key, name }) => (
                            <RoleDisplay
                                key={key}
                                name={name}
                                team={project[key] as Role}
                                allUsers={allUsers}
                            />
                        ))}
                    </div>
                </div>

                {/* Updates Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UpdateDisplay title="上周进展/问题" html={project.lastWeekUpdate} />
                    <UpdateDisplay title="本周进展/问题" html={project.weeklyUpdate} />
                </div>
            </div>

            {/* Card Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-[#363636] bg-gray-50 dark:bg-[#2a2a2a]/50 rounded-b-xl flex justify-end">
                <button
                    onClick={onOpenCommentModal}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#3a3a3a] border border-gray-300 dark:border-[#4a4a4a] rounded-lg hover:bg-gray-100 dark:hover:bg-[#454545] transition-colors"
                >
                    <IconMessageCircle className="w-4 h-4" />
                    评论 ({project.comments.length})
                </button>
            </div>
        </div>
    );
};