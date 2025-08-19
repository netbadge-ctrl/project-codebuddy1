import React from 'react';
import { IconG, IconList, IconBarChart, IconLayoutGrid, IconUser, IconLogOut, IconSun, IconMoon, IconClipboard } from './Icons';
import { ViewType } from '../App';
import { User } from '../types';
import { useTheme } from '../context/theme-context';

interface SidebarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  currentUser: User;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-[#6C63FF] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, currentUser, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <aside className="w-64 bg-gray-100 dark:bg-[#1F1F1F] border-r border-gray-200 dark:border-[#363636] flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center gap-3 p-3 mb-6">
        <IconG className="w-8 h-8"/>
        <span className="text-xl font-bold text-gray-900 dark:text-white">项目中心</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
           <NavItem
            icon={<IconUser className="w-6 h-6" />}
            label="个人视图"
            isActive={view === 'personal'}
            onClick={() => setView('personal')}
          />
          <NavItem
            icon={<IconList className="w-6 h-6" />}
            label="项目总览"
            isActive={view === 'overview'}
            onClick={() => setView('overview')}
          />
          <NavItem
            icon={<IconBarChart className="w-6 h-6" />}
            label="OKR"
            isActive={view === 'okr'}
            onClick={() => setView('okr')}
          />
          <NavItem
            icon={<IconLayoutGrid className="w-6 h-6" />}
            label="看板"
            isActive={view === 'kanban'}
            onClick={() => setView('kanban')}
          />
          <NavItem
            icon={<IconClipboard className="w-6 h-6" />}
            label="周会视图"
            isActive={view === 'weekly'}
            onClick={() => setView('weekly')}
          />
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="p-3 border-t border-gray-200 dark:border-[#363636]">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
            <div className="flex-grow">
              <p className="font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">在线</p>
            </div>
            <div className="flex items-center">
                <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors" aria-label="切换主题">
                    {theme === 'dark' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
                </button>
                <button onClick={onLogout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors" aria-label="登出">
                  <IconLogOut className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};