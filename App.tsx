

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { OKRPage } from './components/OKRPage';
import { KanbanView } from './components/KanbanView';
import { PersonalView } from './components/PersonalView';
import { WeeklyMeetingView } from './components/WeeklyMeetingView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RoleEditModal } from './components/RoleEditModal';
import { CommentModal } from './components/CommentModal';
import { ChangeLogModal } from './components/ChangeLogModal';
import { api } from './api';
import { Project, ProjectStatus, Role, User, ProjectRoleKey, OKR, Priority, Comment, ChangeLogEntry } from './types';

export type ViewType = 'overview' | 'okr' | 'kanban' | 'personal' | 'weekly';

type ModalType = 'role' | 'comments' | 'changelog';
type ModalState = {
  isOpen: boolean;
  type?: ModalType;
  projectId?: string;
  roleKey?: ProjectRoleKey;
  roleName?: string;
  replyToUser?: User;
}

interface AppProps {
  currentUser: User;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ currentUser, onLogout }) => {
  const [view, setView] = useState<ViewType>('personal');
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [fetchedProjects, fetchedOkrs, fetchedUsers] = await Promise.all([
            api.fetchProjects(),
            api.fetchOkrs(),
            api.fetchUsers()
        ]);
        setProjects(fetchedProjects);
        setOkrs(fetchedOkrs);
        setAllUsers(fetchedUsers);
    } catch (error) {
        console.error("Failed to fetch initial data", error);
        // Here you could set an error state and show a message to the user
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect for handling the weekly update rollover
  useEffect(() => {
    const handleWeeklyRollover = async () => {
        const today = new Date();
        // In JavaScript, getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
        const isMonday = today.getDay() === 1;

        if (!isMonday) {
            return;
        }

        const lastRolloverDate = localStorage.getItem('lastWeeklyRolloverDate');
        const todayDateString = today.toISOString().split('T')[0];

        if (lastRolloverDate === todayDateString) {
            return; // Rollover already performed today
        }

        console.log("It's Monday! Performing weekly update rollover...");
        setIsLoading(true);
        try {
            await api.performWeeklyRollover();
            localStorage.setItem('lastWeeklyRolloverDate', todayDateString);
            await fetchData(); // Refetch data to show the changes
        } catch (error) {
            console.error("Failed to perform weekly rollover", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Run this check only after the initial data has loaded
    if (!isLoading) {
        handleWeeklyRollover();
    }
  }, [isLoading, fetchData]);

  const handleCreateProject = useCallback(() => {
    const newProject: Project = {
      id: `new_${Date.now()}`,
      name: '新项目 - 点击编辑',
      priority: Priority.P2,
      status: ProjectStatus.NotStarted,
      businessProblem: '',
      keyResultIds: [],
      weeklyUpdate: '',
      lastWeekUpdate: '',
      productManagers: [],
      backendDevelopers: [],
      frontendDevelopers: [],
      qaTesters: [],
      proposalDate: new Date().toISOString().split('T')[0],
      launchDate: '',
      followers: [],
      comments: [],
      changeLog: [],
      isNew: true,
    };
    setProjects(prev => [newProject, ...prev]);
    setEditingId(newProject.id);
  }, []);

  const handleUpdateProject = useCallback(async (projectId: string, field: keyof Project, value: any) => {
    const projectToUpdate = projects.find(p => p.id === projectId);
    if (!projectToUpdate) return;
    
    if (JSON.stringify(projectToUpdate[field]) === JSON.stringify(value)) {
        return; // Do nothing if value hasn't changed.
    }

    // For new projects, just update local state.
    if (projectToUpdate.isNew) {
        const updatedProject = { ...projectToUpdate, [field]: value };
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
        return;
    }

    // Optimistic Update for existing projects
    const oldValue = projectToUpdate[field];
    const updates: Partial<Project> = { [field]: value };
    
    const loggableFieldLabels: { [K in keyof Project]?: string } = {
        name: '项目名称',
        priority: '优先级',
        status: '状态',
        weeklyUpdate: '本周进展/问题',
        productManagers: '产品经理',
        backendDevelopers: '后端研发',
        frontendDevelopers: '前端研发',
        qaTesters: '测试',
        launchDate: '上线时间',
    };

    const labelForLog = loggableFieldLabels[field];

    if (labelForLog) {
        const newLogEntry: ChangeLogEntry = {
            id: `cl_${Date.now()}`,
            userId: currentUser!.id,
            field: labelForLog,
            oldValue: typeof oldValue === 'object' ? '...' : String(oldValue),
            newValue: typeof value === 'object' ? '...' : String(value),
            changedAt: new Date().toISOString(),
        };
        updates.changeLog = [newLogEntry, ...projectToUpdate.changeLog];
    }

    // Optimistically update local state for a responsive UI.
    setProjects(prevProjects => 
        prevProjects.map(p => 
            p.id === projectId ? { ...p, ...updates } : p
        )
    );
    
    // Asynchronously call the API without blocking UI.
    try {
        await api.updateProject(projectId, updates);
        // On success, state is already updated. No full refresh needed.
    } catch (error) {
        console.error("Failed to update project", error);
        // On failure, alert user and revert to the source of truth.
        alert('项目更新失败，正在恢复数据...');
        await fetchData();
    }
  }, [projects, currentUser, fetchData]);

  const handleSaveNewProject = useCallback(async (projectToSave: Project) => {
    setIsLoading(true);
    setEditingId(null);
    try {
        const creationLogEntry: ChangeLogEntry = {
            id: `cl_${Date.now()}`,
            userId: currentUser!.id,
            field: '项目创建',
            oldValue: '',
            newValue: projectToSave.name,
            changedAt: new Date().toISOString(),
        };
        const projectWithLog = { ...projectToSave, changeLog: [creationLogEntry, ...projectToSave.changeLog] };

        await api.createProject(projectWithLog);
        await fetchData();
    } catch (error) {
        console.error("Failed to save new project", error);
    } finally {
        setIsLoading(false);
    }
  }, [fetchData, currentUser]);
  
  const handleCancelNewProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setEditingId(null);
  }, []);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
        await api.deleteProject(projectId);
        await fetchData();
    } catch(error) {
        console.error("Failed to delete project", error);
    } finally {
        setIsLoading(false);
    }
  }, [fetchData]);

  const handleOpenModal = useCallback((type: ModalType, projectId: string, details: Omit<ModalState, 'isOpen' | 'type' | 'projectId'> = {}) => {
    setModalState({ isOpen: true, type, projectId, ...details });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false });
  }, []);
  
  const handleSaveRole = useCallback(async (projectId: string, roleKey: ProjectRoleKey, newRole: Role) => {
     handleCloseModal();
     await handleUpdateProject(projectId, roleKey, newRole);
  }, [handleUpdateProject, handleCloseModal]);

  const handleUpdateOkrs = async (updatedOkrs: OKR[]) => {
    setIsLoading(true);
    try {
        await api.updateOkrs(updatedOkrs);
        await fetchData();
    } catch (error) {
        console.error("Failed to update OKRs", error);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleToggleFollow = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !currentUser) return;
    
    const isFollowing = project.followers.includes(currentUser.id);
    const newFollowers = isFollowing
        ? project.followers.filter(id => id !== currentUser.id)
        : [...project.followers, currentUser.id];
    
    await handleUpdateProject(projectId, 'followers', newFollowers);
  }, [projects, currentUser, handleUpdateProject]);

  const handleAddComment = useCallback(async (projectId: string, text: string, mentions: string[] = []) => {
      const project = projects.find(p => p.id === projectId);
      if (!project || !currentUser) return;

      const newComment: Comment = {
          id: `c_${Date.now()}`,
          userId: currentUser.id,
          text,
          createdAt: new Date().toISOString(),
          mentions,
      };
      
      const newComments = [...project.comments, newComment];
      await handleUpdateProject(projectId, 'comments', newComments);
      handleCloseModal();
  }, [projects, currentUser, handleUpdateProject, handleCloseModal]);

  const handleReply = useCallback((project: Project, userToReply: User) => {
      handleOpenModal('comments', project.id, { replyToUser: userToReply });
  }, [handleOpenModal]);
  
  const currentProjectForModal = projects.find(p => p.id === modalState.projectId);

  const renderView = () => {
    switch (view) {
      case 'personal':
        return (
          <PersonalView
            projects={projects}
            allUsers={allUsers}
            allOkrs={okrs}
            currentUser={currentUser}
            onUpdateProject={handleUpdateProject}
            onOpenModal={handleOpenModal}
            onToggleFollow={handleToggleFollow}
            onReply={handleReply}
          />
        );
      case 'okr':
        return <OKRPage okrs={okrs} onUpdateOkrs={handleUpdateOkrs} />;
      case 'kanban':
        return <KanbanView projects={projects} allUsers={allUsers} allOkrs={okrs} />;
      case 'weekly':
        return (
            <WeeklyMeetingView
                projects={projects}
                allUsers={allUsers}
                allOkrs={okrs}
                onOpenModal={handleOpenModal}
            />
        );
      case 'overview':
      default:
        return (
          <MainContent
            projects={projects}
            allUsers={allUsers}
            allOkrs={okrs}
            currentUser={currentUser}
            editingId={editingId}
            onCreateProject={handleCreateProject}
            onSaveNewProject={handleSaveNewProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onCancelNewProject={handleCancelNewProject}
            onOpenModal={handleOpenModal}
            onToggleFollow={handleToggleFollow}
            onAddComment={handleAddComment}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-300 font-sans">
      {isLoading && <LoadingSpinner />}
      <Sidebar view={view} setView={setView} currentUser={currentUser} onLogout={onLogout} />
      {renderView()}
      {modalState.isOpen && modalState.type === 'role' && currentProjectForModal && modalState.roleKey && modalState.roleName && (
        <RoleEditModal
            project={currentProjectForModal}
            roleKey={modalState.roleKey}
            roleName={modalState.roleName}
            allUsers={allUsers}
            onClose={handleCloseModal}
            onSave={handleSaveRole}
        />
      )}
      {modalState.isOpen && modalState.type === 'comments' && currentProjectForModal && (
        <CommentModal
          project={currentProjectForModal}
          allUsers={allUsers}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onAddComment={handleAddComment}
          replyToUser={modalState.replyToUser}
        />
      )}
      {modalState.isOpen && modalState.type === 'changelog' && currentProjectForModal && (
          <ChangeLogModal
            project={currentProjectForModal}
            allUsers={allUsers}
            onClose={handleCloseModal}
          />
      )}
    </div>
  );
};

export default App;
