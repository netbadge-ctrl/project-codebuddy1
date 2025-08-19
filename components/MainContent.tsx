import React, { useState, useMemo } from 'react';
import { ProjectTable } from './ProjectTable';
import { FilterBar } from './FilterBar';
import { Project, ProjectStatus, Role, User, ProjectRoleKey, OKR, Priority } from '../types';
import { fuzzySearch } from '../utils';
import { IconPlus } from './Icons';


interface MainContentProps {
  projects: Project[];
  allUsers: User[];
  allOkrs: OKR[];
  currentUser: User;
  editingId: string | null;
  onCreateProject: () => void;
  onSaveNewProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onDeleteProject: (id: string) => void;
  onCancelNewProject: (id: string) => void;
  onOpenModal: (type: 'role' | 'comments' | 'changelog', projectId: string, details?: any) => void;
  onToggleFollow: (projectId: string) => void;
  onAddComment: (projectId: string, text: string) => void;
}


export const MainContent: React.FC<MainContentProps> = (props) => {
  const {
    projects, allUsers, allOkrs, currentUser, editingId, onCreateProject, onSaveNewProject,
    onUpdateProject, onDeleteProject, onCancelNewProject, onOpenModal, onToggleFollow, onAddComment
  } = props;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
  const [selectedBEs, setSelectedBEs] = useState<string[]>([]);
  const [selectedFEs, setSelectedFEs] = useState<string[]>([]);
  const [selectedQAs, setSelectedQAs] = useState<string[]>([]);

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
    const filtered = projects.filter(project => {
        // Search Term
        if (searchTerm && !fuzzySearch(searchTerm, project.name)) {
            return false;
        }
        // Status
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) {
            return false;
        }
        // PMs
        if (selectedPMs.length > 0 && !project.productManagers.some(m => selectedPMs.includes(m.userId))) {
            return false;
        }
        // BEs
        if (selectedBEs.length > 0 && !project.backendDevelopers.some(m => selectedBEs.includes(m.userId))) {
            return false;
        }
        // FEs
        if (selectedFEs.length > 0 && !project.frontendDevelopers.some(m => selectedFEs.includes(m.userId))) {
            return false;
        }
        // QAs
        if (selectedQAs.length > 0 && !project.qaTesters.some(m => selectedQAs.includes(m.userId))) {
            return false;
        }
        return true;
    });

    const priorityOrder: Record<Priority, number> = {
        [Priority.P0]: 0,
        [Priority.P1]: 1,
        [Priority.P2]: 2,
        [Priority.P3]: 3,
    };

    const statusOrder: Record<ProjectStatus, number> = {
        [ProjectStatus.NotStarted]: 8,
        [ProjectStatus.Discussion]: 7,
        [ProjectStatus.RequirementsDone]: 6,
        [ProjectStatus.ReviewDone]: 5,
        [ProjectStatus.InProgress]: 4,
        [ProjectStatus.DevDone]: 3,
        [ProjectStatus.Testing]: 2,
        [ProjectStatus.TestDone]: 1,
        [ProjectStatus.Launched]: 0,
    };
    
    return filtered.sort((a, b) => {
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        const getOkrId = (project: Project) => {
            if (project.keyResultIds.length > 0) {
                return keyResultToOkrMap.get(project.keyResultIds[0]) || 'zzzz';
            }
            return 'zzzz';
        };

        const okrA = getOkrId(a);
        const okrB = getOkrId(b);

        if (okrA.localeCompare(okrB) !== 0) {
            return okrA.localeCompare(okrB);
        }

        const statusA = statusOrder[a.status];
        const statusB = statusOrder[b.status];
        return statusA - statusB;
    });

  }, [projects, searchTerm, selectedStatuses, selectedPMs, selectedBEs, selectedFEs, selectedQAs, keyResultToOkrMap]);
  
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
        <div className="flex justify-end items-center flex-wrap gap-4">
          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF] text-white rounded-lg font-semibold text-sm hover:bg-[#5a52d9] transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            <span>创建项目</span>
          </button>
        </div>
        <FilterBar
          allUsers={allUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedPMs={selectedPMs}
          setSelectedPMs={setSelectedPMs}
          selectedBEs={selectedBEs}
          setSelectedBEs={setSelectedBEs}
          selectedFEs={selectedFEs}
          setSelectedFEs={setSelectedFEs}
          selectedQAs={selectedQAs}
          setSelectedQAs={setSelectedQAs}
        />
        <ProjectTable
          projects={filteredAndSortedProjects}
          allUsers={allUsers}
          allOkrs={allOkrs}
          currentUser={currentUser}
          editingId={editingId}
          onSaveNewProject={onSaveNewProject}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
          onCancelNewProject={onCancelNewProject}
          onOpenModal={onOpenModal}
          onToggleFollow={onToggleFollow}
        />
      </div>
    </main>
  );
};