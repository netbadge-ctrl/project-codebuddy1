import React, { useState } from 'react';
import { ThemeProvider } from './components/theme-provider';
import Sidebar from './components/Sidebar';
import PersonalView from './components/PersonalView';
import ProjectOverview from './components/ProjectOverview';
import OKRPage from './components/OKRPage';
import KanbanView from './components/KanbanView';
import WeeklyMeetingView from './components/WeeklyMeetingView';

type ViewType = 'personal' | 'projects' | 'okr' | 'kanban' | 'weekly';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('personal');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'personal':
        return <PersonalView />;
      case 'projects':
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
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-auto transition-all duration-300">
          {renderCurrentView()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;