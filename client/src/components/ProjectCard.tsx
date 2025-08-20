import React from 'react';
import { Project } from '../types';
import { useData } from '../contexts/DataContext';
import { getStatusColor, getPriorityColor } from '../utils/style';
import { User } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { users } = useData();

  const getProductManager = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  return (
    <div onClick={onClick} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <h3 className="font-bold text-lg mb-2 truncate">{project.name}</h3>
      <div className="flex items-center space-x-2 mb-3 text-xs">
        <span className={`px-2 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <span className={`px-2 py-1 rounded-full font-semibold ${getPriorityColor(project.priority)}`}>
          {project.priority}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <User className="w-4 h-4 mr-2 text-gray-400" />
        <span>产品经理:</span>
        <div className="flex items-center ml-2">
          {project.productManagers.map((pm, index) => {
            const user = getProductManager(pm.userId);
            return user ? (
              <img
                key={user.id}
                src={user.avatarUrl}
                alt={user.name}
                title={user.name}
                className={`w-6 h-6 rounded-full border-2 border-white ${index > 0 ? '-ml-2' : ''}`}
              />
            ) : null;
          })}
          {project.productManagers.length === 0 && <span className="text-gray-500">未指定</span>}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;