import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Project, OkrSet } from '../types';
import * as api from '../api';
import toast from 'react-hot-toast';

interface DataContextType {
  users: User[];
  projects: Project[];
  okrSets: OkrSet[];
  loading: boolean;
  refetchData: () => void;
  updateProjectInState: (updatedProject: Project) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrSets, setOkrSets] = useState<OkrSet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, projectsData, okrSetsData] = await Promise.all([
        api.fetchUsers(),
        api.fetchProjects(),
        api.fetchOkrSets(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      setOkrSets(okrSetsData);
    } catch (error) {
      toast.error('加载核心数据失败，请刷新页面重试。');
      console.error('Failed to fetch core data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const updateProjectInState = (updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  };

  return (
    <DataContext.Provider value={{ users, projects, okrSets, loading, refetchData: fetchData, updateProjectInState }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};