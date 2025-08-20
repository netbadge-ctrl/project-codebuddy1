import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { useData } from '../../contexts/DataContext';
import * as api from '../../api';
import toast from 'react-hot-toast';

interface EditableCellProps {
  getValue: () => any;
  row: { original: Project };
  column: { id: string };
  updateData: (rowIndex: number, columnId: string, value: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ getValue, row, column, updateData }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const { updateProjectInState } = useData();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = async () => {
    if (value === initialValue) return; // No change

    const project = row.original;
    const toastId = toast.loading('正在保存...');
    
    try {
      const updatedProject = await api.updateProject(project.id, { [column.id]: value });
      updateProjectInState(updatedProject);
      toast.success('保存成功！', { id: toastId });
    } catch (error) {
      toast.error('保存失败，请重试。', { id: toastId });
      setValue(initialValue); // Revert change on failure
    }
  };

  return (
    <input
      value={value as string}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full p-1 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-400 rounded-md"
    />
  );
};

export default EditableCell;