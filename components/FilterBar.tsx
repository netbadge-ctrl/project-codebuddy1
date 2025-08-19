import React from 'react';
import { User, ProjectStatus } from '../types';
import { IconSearch } from './Icons';
import { MultiSelectDropdown } from './MultiSelectDropdown';

interface FilterBarProps {
    allUsers: User[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedStatuses: string[];
    setSelectedStatuses: (statuses: string[]) => void;
    selectedPMs: string[];
    setSelectedPMs: (pmIds: string[]) => void;
    selectedBEs: string[];
    setSelectedBEs: (beIds: string[]) => void;
    selectedFEs: string[];
    setSelectedFEs: (feIds: string[]) => void;
    selectedQAs: string[];
    setSelectedQAs: (qaIds: string[]) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    allUsers,
    searchTerm,
    setSearchTerm,
    selectedStatuses,
    setSelectedStatuses,
    selectedPMs,
    setSelectedPMs,
    selectedBEs,
    setSelectedBEs,
    selectedFEs,
    setSelectedFEs,
    selectedQAs,
    setSelectedQAs,
}) => {
    
    const statusOptions = Object.values(ProjectStatus).map(s => ({ value: s, label: s }));
    const userOptions = allUsers.map(u => ({ value: u.id, label: u.name }));
    
    return (
        <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl p-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-grow min-w-[200px]">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="按项目名称搜索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-lg pl-10 pr-4 py-2 w-full text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                />
            </div>
            <MultiSelectDropdown
                options={statusOptions}
                selectedValues={selectedStatuses}
                onSelectionChange={setSelectedStatuses}
                placeholder="状态"
            />
            <MultiSelectDropdown
                options={userOptions}
                selectedValues={selectedPMs}
                onSelectionChange={setSelectedPMs}
                placeholder="产品经理"
            />
            <MultiSelectDropdown
                options={userOptions}
                selectedValues={selectedBEs}
                onSelectionChange={setSelectedBEs}
                placeholder="后端研发"
            />
            <MultiSelectDropdown
                options={userOptions}
                selectedValues={selectedFEs}
                onSelectionChange={setSelectedFEs}
                placeholder="前端研发"
            />
            <MultiSelectDropdown
                options={userOptions}
                selectedValues={selectedQAs}
                onSelectionChange={setSelectedQAs}
                placeholder="测试"
            />
        </div>
    );
};