import React from 'react';
import { ViewType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  { id: 'personal' as ViewType, name: '个人视图', icon: '👤' },
  { id: 'overview' as ViewType, name: '项目总览', icon: '📊' },
  { id: 'okr' as ViewType, name: 'OKR管理', icon: '🎯' },
  { id: 'kanban' as ViewType, name: '看板视图', icon: '📋' },
  { id: 'weekly' as ViewType, name: '周会视图', icon: '📅' },
];

function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* 用户信息 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            className="h-10 w-10 rounded-full"
            src={user?.avatarUrl}
            alt={user?.name}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500">项目管理员</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === item.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="mr-3 text-lg">🚪</span>
          退出登录
        </button>
      </div>
    </div>
  );
}

export default Sidebar;