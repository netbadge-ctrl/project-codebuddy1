import React from 'react';
import { User, Project, OKR } from '../types';
import { MultiSelectDropdown } from './MultiSelectDropdown';

interface KanbanFilterBarProps {
    allUsers: User[];
    allProjects: Project[];
    allOkrs: OKR[];
    selectedUsers: string[];
    setSelectedUsers: (ids: string[]) => void;
    selectedProjects: string[];
    setSelectedProjects: (ids: string[]) => void;
    selectedKrs: string[];
    setSelectedKrs: (ids: string[]) => void;
}

export const KanbanFilterBar: React.FC<KanbanFilterBarProps> = ({
    allUsers,
    allProjects,
    allOkrs,
    selectedUsers,
    setSelectedUsers,
    selectedProjects,
    setSelectedProjects,
    selectedKrs,
    setSelectedKrs
}) => {
    
    const userOptions = allUsers.map(u => ({ value: u.id, label: u.name }));
    const projectOptions = allProjects.map(p => ({ value: p.id, label: p.name }));
    const krOptions = allOkrs.flatMap((okr, okrIndex) => 
        okr.keyResults.map((kr, krIndex) => ({
            value: kr.id,
            label: `O${okrIndex + 1}-KR${krIndex + 1}: ${kr.description}`
        }))
    );
    
    return (
        <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl p-4 flex flex-wrap items-center gap-4 flex-shrink-0 relative z-30">
            <MultiSelectDropdown
                options={userOptions}
                selectedValues={selectedUsers}
                onSelectionChange={setSelectedUsers}
                placeholder="按成员筛选"
            />
            <MultiSelectDropdown
                options={projectOptions}
                selectedValues={selectedProjects}
                onSelectionChange={setSelectedProjects}
                placeholder="按项目筛选"
            />
            <MultiSelectDropdown
                options={krOptions}
                selectedValues={selectedKrs}
                onSelectionChange={setSelectedKrs}
                placeholder="按KR筛选"
            />
        </div>
    );
};