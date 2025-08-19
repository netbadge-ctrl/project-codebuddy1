import React from 'react';
import { User, ProjectStatus, OKR, Priority } from '../types';
import { MultiSelectDropdown } from './MultiSelectDropdown';

interface WeeklyMeetingFilterBarProps {
    allUsers: User[];
    allOkrs: OKR[];
    
    selectedPriorities: string[];
    setSelectedPriorities: (values: string[]) => void;
    
    selectedOkrIds: string[];
    setSelectedOkrIds: (values: string[]) => void;

    selectedParticipantIds: string[];
    setSelectedParticipantIds: (values: string[]) => void;
    
    selectedStatuses: string[];
    setSelectedStatuses: (values: string[]) => void;
}

export const WeeklyMeetingFilterBar: React.FC<WeeklyMeetingFilterBarProps> = ({
    allUsers,
    allOkrs,
    selectedPriorities,
    setSelectedPriorities,
    selectedOkrIds,
    setSelectedOkrIds,
    selectedParticipantIds,
    setSelectedParticipantIds,
    selectedStatuses,
    setSelectedStatuses
}) => {
    
    const priorityOptions = Object.values(Priority).map(p => ({ value: p, label: p }));
    
    const okrOptions = allOkrs.map((okr, index) => ({ 
        value: okr.id, 
        label: `O${index + 1}: ${okr.objective}`
    }));
    
    const participantOptions = allUsers.map(u => ({ value: u.id, label: u.name }));
    
    const statusOptions = Object.values(ProjectStatus)
        .filter(s => s !== ProjectStatus.Launched && s !== ProjectStatus.NotStarted)
        .map(s => ({ value: s, label: s }));
    
    return (
        <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl p-4 flex flex-wrap items-center gap-4 mb-6">
            <MultiSelectDropdown
                options={priorityOptions}
                selectedValues={selectedPriorities}
                onSelectionChange={setSelectedPriorities}
                placeholder="优先级"
            />
            <MultiSelectDropdown
                options={okrOptions}
                selectedValues={selectedOkrIds}
                onSelectionChange={setSelectedOkrIds}
                placeholder="OKR"
            />
            <MultiSelectDropdown
                options={participantOptions}
                selectedValues={selectedParticipantIds}
                onSelectionChange={setSelectedParticipantIds}
                placeholder="参与人"
            />
            <MultiSelectDropdown
                options={statusOptions}
                selectedValues={selectedStatuses}
                onSelectionChange={setSelectedStatuses}
                placeholder="状态"
            />
        </div>
    );
};