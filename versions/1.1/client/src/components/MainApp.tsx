import React, { useState } from 'react';
import { ViewType } from '../types';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import PersonalView from './views/PersonalView';
import ProjectOverview from './views/ProjectOverview';
import OKRPage from './views/OKRPage';
import KanbanView from './views/KanbanView';
import WeeklyMeetingView from './views/WeeklyMeetingView';

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('personal');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'personal':
        return <PersonalView />;
      case 'overview':
        return <ProjectOverview />;
      case 'okr':
        return <OKRPage />;
      case 'kanban':
        return <KanbanView />;
      case 'weekly':
        return <WeeklyMeetingView />;
      default:
        return <PersonalView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default MainApp;