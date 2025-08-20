import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginScreen } from './screens/LoginScreen';
import Sidebar from './components/Sidebar';
import PersonalView from './views/PersonalView';
import ProjectTableView from './views/ProjectTableView';
import OkrView from './views/OkrView';
import { KanbanView } from './views/KanbanView';
import { WeeklyMeetingView } from './views/WeeklyMeetingView';

type View = 'personal' | 'table' | 'okr' | 'kanban' | 'meeting';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('personal');

  const renderView = () => {
    switch (currentView) {
      case 'personal':
        return <PersonalView />;
      case 'table':
        return <ProjectTableView />;
      case 'okr':
        return <OkrView />;
      case 'kanban':
        return <KanbanView />;
      case 'meeting':
        return <WeeklyMeetingView />;
      default:
        return <PersonalView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-8 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return user ? (
    <DataProvider>
      <MainApp />
    </DataProvider>
  ) : (
    <LoginScreen />
  );
};

export default App;
