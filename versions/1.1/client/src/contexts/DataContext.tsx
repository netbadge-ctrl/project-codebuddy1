import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Project, OKRSet, FilterState } from '../types';
import { DEFAULT_FILTER_STATE, STORAGE_KEYS } from '../constants';
import { api } from '../api';

interface DataContextType {
  // 数据状态
  users: User[];
  projects: Project[];
  okrSets: OKRSet[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 筛选状态
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  
  // 数据操作方法
  refreshData: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshOKRSets: () => Promise<void>;
  
  // 项目操作
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updateData: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  // OKR操作
  createOKRSet: (periodId: string, periodName: string) => Promise<OKRSet>;
  updateOKRSet: (periodId: string, okrs: any[]) => Promise<OKRSet>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrSets, setOkrSets] = useState<OKRSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [filters, setFiltersState] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch {
        return DEFAULT_FILTER_STATE;
      }
    }
    return DEFAULT_FILTER_STATE;
  });

  // 保存筛选状态到本地存储
  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(newFilters));
  }, []);

  // 获取用户数据
  const fetchUsers = useCallback(async () => {
    try {
      const userData = await api.fetchUsers();
      setUsers(userData);
    } catch (err) {
      console.error('获取用户数据失败:', err);
      throw err;
    }
  }, []);

  // 获取项目数据
  const fetchProjects = useCallback(async () => {
    try {
      const projectData = await api.fetchProjects();
      setProjects(projectData);
    } catch (err) {
      console.error('获取项目数据失败:', err);
      throw err;
    }
  }, []);

  // 获取OKR数据
  const fetchOKRSets = useCallback(async () => {
    try {
      const okrData = await api.fetchOKRSets();
      setOkrSets(okrData);
    } catch (err) {
      console.error('获取OKR数据失败:', err);
      throw err;
    }
  }, []);

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchUsers(),
        fetchProjects(),
        fetchOKRSets()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '数据加载失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, fetchProjects, fetchOKRSets]);

  // 刷新项目数据
  const refreshProjects = useCallback(async () => {
    try {
      await fetchProjects();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '项目数据加载失败';
      setError(errorMessage);
    }
  }, [fetchProjects]);

  // 刷新OKR数据
  const refreshOKRSets = useCallback(async () => {
    try {
      await fetchOKRSets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OKR数据加载失败';
      setError(errorMessage);
    }
  }, [fetchOKRSets]);

  // 创建项目
  const createProject = useCallback(async (projectData: Partial<Project>): Promise<Project> => {
    try {
      const newProject = await api.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建项目失败';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 更新项目
  const updateProject = useCallback(async (id: string, updateData: Partial<Project>): Promise<Project> => {
    try {
      const updatedProject = await api.updateProject(id, updateData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新项目失败';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 删除项目
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除项目失败';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 创建OKR集合
  const createOKRSet = useCallback(async (periodId: string, periodName: string): Promise<OKRSet> => {
    try {
      const newOKRSet = await api.createOKRSet(periodId, periodName);
      setOkrSets(prev => [...prev, newOKRSet]);
      return newOKRSet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建OKR周期失败';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 更新OKR集合
  const updateOKRSet = useCallback(async (periodId: string, okrs: any[]): Promise<OKRSet> => {
    try {
      const updatedOKRSet = await api.updateOKRSet(periodId, okrs);
      setOkrSets(prev => prev.map(set => set.periodId === periodId ? updatedOKRSet : set));
      return updatedOKRSet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新OKR失败';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value: DataContextType = {
    users,
    projects,
    okrSets,
    isLoading,
    error,
    filters,
    setFilters,
    refreshData,
    refreshProjects,
    refreshOKRSets,
    createProject,
    updateProject,
    deleteProject,
    createOKRSet,
    updateOKRSet
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}