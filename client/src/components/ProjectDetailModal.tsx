import React, { useState } from 'react';
import { Project } from '../types';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import * as api from '../api';
import toast from 'react-hot-toast';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const { updateProjectInState } = useData();
  const [weeklyUpdate, setWeeklyUpdate] = useState(project?.weeklyUpdate || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!project) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProject = await api.updateProject(project.id, { weeklyUpdate });
      updateProjectInState(updatedProject);
      toast.success('本周进展已保存！');
      onClose();
    } catch (error) {
      toast.error('保存失败，请重试。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={!!project} onClose={onClose} title={project.name}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">业务问题</h4>
          <p className="text-gray-700">{project.businessProblem || '未填写'}</p>
        </div>
        <div>
          <h4 className="font-semibold">本周进展</h4>
          <textarea
            value={weeklyUpdate}
            onChange={(e) => setWeeklyUpdate(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            rows={4}
            placeholder="记录本周的进展和遇到的问题..."
          />
        </div>
        <div>
          <h4 className="font-semibold">上周进展</h4>
          <div className="p-2 bg-gray-100 rounded mt-1">
            {project.lastWeekUpdate || '无上周进展记录。'}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            关闭
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSaving ? '保存中...' : '保存进展'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectDetailModal;