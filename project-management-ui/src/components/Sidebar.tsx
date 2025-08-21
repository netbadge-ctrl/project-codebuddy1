import React, { useState } from 'react';
import { 
  User, 
  FolderOpen, 
  Target, 
  Calendar, 
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { Button } from './ui/button';

type ViewType = 'personal' | 'projects' | 'okr' | 'kanban' | 'weekly';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'personal' as ViewType,
      label: '个人视图',
      icon: User,
    },
    {
      id: 'projects' as ViewType,
      label: '项目总览',
      icon: FolderOpen,
    },
    {
      id: 'okr' as ViewType,
      label: 'OKR',
      icon: Target,
    },
    {
      id: 'kanban' as ViewType,
      label: '看板',
      icon: Calendar,
    },
    {
      id: 'weekly' as ViewType,
      label: '周会视图',
      icon: Users,
    },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-44'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* 顶部收起按钮 */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        {!isCollapsed && (
          <div className="text-sm font-medium text-gray-900">项目管理</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* 用户信息 */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">张三</div>
              <div className="text-xs text-gray-500">产品经理</div>
            </div>
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start gap-2 px-3'} h-9 ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onViewChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* 底部设置 */}
      <div className="p-2 border-t border-gray-200">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start gap-2 px-3'} h-9 text-gray-700`}
            title={isCollapsed ? '设置' : undefined}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">设置</span>}
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start gap-2 px-3'} h-9 text-gray-700`}
            title={isCollapsed ? '退出登录' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">退出登录</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
