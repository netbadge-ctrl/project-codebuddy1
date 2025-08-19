import React, { useMemo, useState } from 'react';
import { Project, User, ProjectStatus, Priority, OKR } from '../types';
import { WeeklyMeetingProjectCard } from './WeeklyMeetingProjectCard';
import { WeeklyMeetingFilterBar } from './WeeklyMeetingFilterBar';

interface WeeklyMeetingViewProps {
    projects: Project[];
    allUsers: User[];
    allOkrs: OKR[];
    onOpenModal: (type: 'comments', projectId: string, details?: any) => void;
}

export const WeeklyMeetingView: React.FC<WeeklyMeetingViewProps> = ({ projects, allUsers, allOkrs, onOpenModal }) => {
    // State for filters
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
    const [selectedOkrIds, setSelectedOkrIds] = useState<string[]>([]);
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const keyResultToOkrMap = useMemo(() => {
        const map = new Map<string, string>();
        allOkrs.forEach(okr => {
            okr.keyResults.forEach(kr => {
                map.set(kr.id, okr.id);
            });
        });
        return map;
    }, [allOkrs]);

    const filteredAndSortedProjects = useMemo(() => {
        // 1. Initial filter for active projects
        let filteredProjects = projects.filter(p => 
            p.status !== ProjectStatus.Launched && 
            p.status !== ProjectStatus.NotStarted
        );

        // 2. Apply UI filters
        filteredProjects = filteredProjects.filter(project => {
            if (selectedPriorities.length > 0 && !selectedPriorities.includes(project.priority)) {
                return false;
            }
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) {
                return false;
            }
            if (selectedParticipantIds.length > 0) {
                const projectParticipants = new Set([
                    ...project.productManagers.map(m => m.userId),
                    ...project.backendDevelopers.map(m => m.userId),
                    ...project.frontendDevelopers.map(m => m.userId),
                    ...project.qaTesters.map(m => m.userId),
                ]);
                if (!selectedParticipantIds.some(id => projectParticipants.has(id))) {
                    return false;
                }
            }
            if (selectedOkrIds.length > 0) {
                const projectOkrIds = new Set(project.keyResultIds.map(krId => keyResultToOkrMap.get(krId)).filter(Boolean));
                if (!selectedOkrIds.some(id => projectOkrIds.has(id))) {
                    return false;
                }
            }
            return true;
        });
        
        // 3. Sorting
        const priorityOrder: Record<Priority, number> = {
            [Priority.P0]: 0,
            [Priority.P1]: 1,
            [Priority.P2]: 2,
            [Priority.P3]: 3,
        };
        
        return filteredProjects.sort((a, b) => {
            // Sort by Priority
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // Sort by OKR ID
            const getOkrId = (project: Project) => {
                if (project.keyResultIds.length > 0) {
                    const firstKrId = project.keyResultIds[0];
                    return keyResultToOkrMap.get(firstKrId) || 'zzzz';
                }
                return 'zzzz';
            };
            const okrA = getOkrId(a);
            const okrB = getOkrId(b);
            if (okrA.localeCompare(okrB) !== 0) {
                return okrA.localeCompare(okrB);
            }

            // Sort by Product Manager name
            const getPmName = (project: Project) => {
                if (project.productManagers.length > 0) {
                    const pm = allUsers.find(u => u.id === project.productManagers[0].userId);
                    return pm ? pm.name : 'zzzz';
                }
                return 'zzzz';
            };
            const pmA = getPmName(a);
            const pmB = getPmName(b);
            if (pmA.localeCompare(pmB) !== 0) {
                return pmA.localeCompare(pmB);
            }

            // Fallback sort
            return new Date(b.proposalDate).getTime() - new Date(a.proposalDate).getTime();
        });
    }, [projects, allUsers, keyResultToOkrMap, selectedPriorities, selectedOkrIds, selectedParticipantIds, selectedStatuses]);

    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-gray-100 dark:bg-[#1f1f1f]">
                <WeeklyMeetingFilterBar
                    allUsers={allUsers}
                    allOkrs={allOkrs}
                    selectedPriorities={selectedPriorities}
                    setSelectedPriorities={setSelectedPriorities}
                    selectedOkrIds={selectedOkrIds}
                    setSelectedOkrIds={setSelectedOkrIds}
                    selectedParticipantIds={selectedParticipantIds}
                    setSelectedParticipantIds={setSelectedParticipantIds}
                    selectedStatuses={selectedStatuses}
                    setSelectedStatuses={setSelectedStatuses}
                />
                {filteredAndSortedProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredAndSortedProjects.map(project => (
                            <WeeklyMeetingProjectCard
                                key={project.id}
                                project={project}
                                allUsers={allUsers}
                                allOkrs={allOkrs}
                                onOpenCommentModal={() => onOpenModal('comments', project.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#232323] border border-dashed border-gray-200 dark:border-[#363636] rounded-xl p-12 text-center text-gray-400 dark:text-gray-500">
                        <p>没有符合筛选条件的项目</p>
                    </div>
                )}
            </div>
        </main>
    );
};