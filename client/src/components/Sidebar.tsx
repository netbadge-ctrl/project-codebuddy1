import React from 'react';
import { Home, List, Target, KanbanSquare, Presentation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type View = 'personal' | 'table' | 'okr' | 'kanban' | 'meeting';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems = [
  { id: 'personal', label: '个人视图', icon: Home },
  { id: 'table', label: '项目总览', icon: List },
  { id: 'okr', label: 'OKR', icon: Target },
  { id: 'kanban', label: '看板', icon: KanbanSquare },
  { id: 'meeting', label: '周会', icon: Presentation },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">项目管理</h1>
      </div>
      <nav className="flex-grow p-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.id as View);
                }}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <p className="font-semibold">{user?.name}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          登出
        </button>
      </div>
    </div>
  );
};

export default Sidebar;