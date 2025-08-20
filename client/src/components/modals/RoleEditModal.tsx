import React, { useState, useEffect } from 'react';
import { Project, Role, User } from '../../types';
import { useData } from '../../contexts/DataContext';
import * as api from '../../api';
import toast from 'react-hot-toast';
import Modal from '../Modal';
import { Plus, Trash2, User as UserIcon } from 'lucide-react';

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  roleKey: keyof Project | null;
  roleName: string;
}

const RoleEditModal: React.FC<RoleEditModalProps> = ({ isOpen, onClose, project, roleKey, roleName }) => {
  const { users, updateProjectInState } = useData();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (project && roleKey) {
      setRoles(project[roleKey] as Role[]);
    }
  }, [project, roleKey]);

  if (!project || !roleKey) return null;

  const handleAddRole = () => {
    const newRole: Role = {
      userId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      useSharedSchedule: false,
    };
    setRoles([...roles, newRole]);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index: number, field: keyof Role, value: any) => {
    const newRoles = [...roles];
    (newRoles[index] as any)[field] = value;
    setRoles(newRoles);
  };

  const handleSave = async () => {
    // Filter out empty roles before saving
    const validRoles = roles.filter(role => role.userId);
    const toastId = toast.loading('正在保存...');
    try {
      const updatedProject = await api.updateProject(project.id, { [roleKey]: validRoles });
      updateProjectInState(updatedProject);
      toast.success(`${roleName}已更新！`, { id: toastId });
      onClose();
    } catch (error) {
      toast.error('保存失败，请重试。', { id: toastId });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`编辑 ${project.name} - ${roleName}`}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {roles.map((role, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
            <UserIcon className="text-gray-400" />
            <select
              value={role.userId}
              onChange={(e) => handleRoleChange(index, 'userId', e.target.value)}
              className="flex-1 p-1 border rounded-md"
            >
              <option value="" disabled>选择用户</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input
              type="date"
              value={role.startDate}
              onChange={(e) => handleRoleChange(index, 'startDate', e.target.value)}
              className="p-1 border rounded-md"
            />
            <input
              type="date"
              value={role.endDate}
              onChange={(e) => handleRoleChange(index, 'endDate', e.target.value)}
              className="p-1 border rounded-md"
            />
            <button onClick={() => handleRemoveRole(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleAddRole} className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-800">
        <Plus className="w-4 h-4" />
        <span>添加成员</span>
      </button>
      <div className="flex justify-end space-x-2 mt-6">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">取消</button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">保存</button>
      </div>
    </Modal>
  );
};

export default RoleEditModal;