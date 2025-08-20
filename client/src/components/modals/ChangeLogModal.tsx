import React from 'react';
import { Project, ChangeLogEntry } from '../../types';
import Modal from '../Modal';
import { useData } from '../../contexts/DataContext';
import { formatTimeToNow } from '../../utils/date';
import { ArrowRight } from 'lucide-react';

interface ChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ isOpen, onClose, project }) => {
  const { users } = useData();

  if (!project) return null;

  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return <pre className="text-xs bg-gray-100 p-1 rounded-md">{JSON.stringify(value, null, 2)}</pre>;
    }
    return <span className="font-semibold">{value || '空'}</span>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`变更记录 - ${project.name}`}>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <ul className="space-y-4">
          {project.changeLog.map((entry: ChangeLogEntry) => {
            const user = users.find(u => u.id === entry.userId);
            return (
              <li key={entry.id} className="flex items-start space-x-3">
                <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full mt-1" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-bold">{user?.name || '系统'}</span>
                    <span className="text-gray-500"> 修改了 </span>
                    <span className="font-bold">{entry.field}</span>
                  </p>
                  <div className="flex items-center space-x-2 text-sm mt-1">
                    {renderValue(entry.oldValue)}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    {renderValue(entry.newValue)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeToNow(entry.changedAt)}</p>
                </div>
              </li>
            );
          })}
           {project.changeLog.length === 0 && <p className="text-gray-500">暂无变更记录。</p>}
        </ul>
      </div>
    </Modal>
  );
};

export default ChangeLogModal;