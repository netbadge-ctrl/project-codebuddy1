import React from 'react';
import { Role } from '../../types';
import { useData } from '../../contexts/DataContext';
import { PlusCircle } from 'lucide-react';

interface RoleCellProps {
  getValue: () => Role[];
  onClick: () => void;
}

const RoleCell: React.FC<RoleCellProps> = ({ getValue, onClick }) => {
  const roles = getValue() || [];
  const { users } = useData();

  return (
    <div
      className="flex items-center space-x-1 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex -space-x-2">
        {roles.map((role) => {
          const user = users.find((u) => u.id === role.userId);
          return user ? (
            <img
              key={user.id}
              src={user.avatarUrl}
              alt={user.name}
              title={user.name}
              className="w-6 h-6 rounded-full border-2 border-white"
            />
          ) : null;
        })}
      </div>
      <PlusCircle className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
    </div>
  );
};

export default RoleCell;