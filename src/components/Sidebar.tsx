import React from 'react';
import { ArrowLeft, User, BarChart3, Target, Calendar, Users } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: 'personal' | 'projects' | 'okr' | 'kanban' | 'weekly') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'personal', label: '个人视图', icon: User },
    { id: 'projects', label: '项目总览', icon: BarChart3 },
    { id: 'okr', label: 'OKR', icon: Target },
    { id: 'kanban', label: '看板', icon: Calendar },
    { id: 'weekly', label: '周会视图', icon: Users },
  ];

  return (
    <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-900 font-medium">
          <ArrowLeft className="w-5 h-5 text-blue-600" />
          <span>项目中心</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="/placeholder.svg?height=32&width=32"
            alt="张三"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">张三</div>
            <div className="text-xs text-gray-500">在线</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;