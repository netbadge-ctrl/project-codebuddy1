import React from 'react';
import { Project, ProjectStatus, ProjectPriority } from '../../types';
import { useData } from '../../contexts/DataContext';
import * as api from '../../api';
import toast from 'react-hot-toast';
import { getStatusColor, getPriorityColor } from '../../utils/style';

interface SelectCellProps {
  getValue: () => any;
  row: { original: Project };
  column: { id: string };
  options: readonly string[];
}

const SelectCell: React.FC<SelectCellProps> = ({ getValue, row, column, options }) => {
  const initialValue = getValue();
  const { updateProjectInState } = useData();

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const project = row.original;
    const toastId = toast.loading('正在保存...');

    try {
      const updatedProject = await api.updateProject(project.id, { [column.id]: newValue });
      updateProjectInState(updatedProject);
      toast.success('保存成功！', { id: toastId });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '保存失败，请重试。';
      toast.error(errorMessage, { id: toastId });
      // Note: We don't revert the select value visually to avoid jarring UX.
      // The local state will be synced on the next data refetch.
    }
  };
  
  const getColorClass = () => {
    if (column.id === 'status') {
        return getStatusColor(initialValue as ProjectStatus);
    }
    if (column.id === 'priority') {
        return getPriorityColor(initialValue as ProjectPriority);
    }
    return 'bg-gray-100 text-gray-800';
  }

  return (
    <select
      value={initialValue}
      onChange={onChange}
      className={`w-full p-1 border-none rounded-full text-xs font-semibold appearance-none text-center focus:ring-2 focus:ring-blue-400 ${getColorClass()}`}
    >
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default SelectCell;