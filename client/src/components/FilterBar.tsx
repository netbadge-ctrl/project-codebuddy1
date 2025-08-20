import React from 'react';
import { ProjectStatus, ProjectPriority, ProjectStatuses, ProjectPriorities } from '../types';
import { useData } from '../contexts/DataContext';
import MultiSelectDropdown, { GroupedOption } from './MultiSelectDropdown';
import { Search } from 'lucide-react';

export interface Filters {
  query: string;
  statuses: ProjectStatus[];
  priorities: ProjectPriority[];
  userIds: string[];
  krIds: string[];
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const { users, okrSets } = useData();

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const userOptions: GroupedOption[] = [{
    label: '所有用户',
    options: users.map(u => ({ value: u.id, label: u.name })),
  }];

  const statusOptions: GroupedOption[] = [{
    label: '所有状态',
    options: ProjectStatuses.map(s => ({ value: s, label: s })),
  }];

  const priorityOptions: GroupedOption[] = [{
    label: '所有优先级',
    options: ProjectPriorities.map(p => ({ value: p, label: p })),
  }];
  
  const okrOptions: GroupedOption[] = okrSets.flatMap(set =>
    set.okrs.map(okr => ({
      label: okr.objective,
      options: okr.keyResults.map(kr => ({
        value: kr.id,
        label: kr.description,
      })),
    }))
  );

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-4 flex flex-wrap items-center gap-4">
      <div className="relative flex-grow min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索项目名称..."
          value={filters.query}
          onChange={e => handleFilterChange('query', e.target.value)}
          className="w-full p-2 pl-10 border rounded-md shadow-sm"
        />
      </div>
      <MultiSelectDropdown
        options={statusOptions}
        selectedValues={filters.statuses}
        onChange={selected => handleFilterChange('statuses', selected)}
        placeholder="状态"
      />
      <MultiSelectDropdown
        options={priorityOptions}
        selectedValues={filters.priorities}
        onChange={selected => handleFilterChange('priorities', selected)}
        placeholder="优先级"
      />
      <MultiSelectDropdown
        options={userOptions}
        selectedValues={filters.userIds}
        onChange={selected => handleFilterChange('userIds', selected)}
        placeholder="相关人员"
      />
      <MultiSelectDropdown
        options={okrOptions}
        selectedValues={filters.krIds}
        onChange={selected => handleFilterChange('krIds', selected)}
        placeholder="关联KR"
      />
    </div>
  );
};

export default FilterBar;