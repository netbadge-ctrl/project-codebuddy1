import React, { useMemo } from 'react';
import { Project } from '../../types';
import { useData } from '../../contexts/DataContext';
import * as api from '../../api';
import toast from 'react-hot-toast';
import MultiSelectDropdown, { GroupedOption } from '../MultiSelectDropdown';

interface OkrMultiSelectCellProps {
  getValue: () => string[];
  row: { original: Project };
  column: { id: string };
}

const OkrMultiSelectCell: React.FC<OkrMultiSelectCellProps> = ({ getValue, row }) => {
  const { okrSets, updateProjectInState } = useData();
  const project = row.original;
  const selectedKrs = getValue() || [];

  const okrOptions = useMemo<GroupedOption[]>(() => {
    return okrSets.flatMap(set =>
      set.okrs.map(okr => ({
        label: okr.objective,
        options: okr.keyResults.map(kr => ({
          value: kr.id,
          label: kr.description,
        })),
      }))
    );
  }, [okrSets]);

  const handleChange = async (newKrIds: string[]) => {
    const toastId = toast.loading('正在保存...');
    try {
      const updatedProject = await api.updateProject(project.id, { keyResultIds: newKrIds });
      updateProjectInState(updatedProject);
      toast.success('关联KR已更新！', { id: toastId });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '保存失败，请重试。';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const isRequired = project.priority === '部门OKR相关' && selectedKrs.length === 0;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-grow">
        <MultiSelectDropdown
          options={okrOptions}
          selectedValues={selectedKrs}
          onChange={handleChange}
          placeholder="关联KR"
        />
      </div>
      {isRequired && (
        <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded-full">
          必填
        </span>
      )}
    </div>
  );
};

export default OkrMultiSelectCell;