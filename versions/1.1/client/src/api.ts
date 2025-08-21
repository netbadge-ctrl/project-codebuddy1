import { User, Project, OKRSet, ProjectStatus, ProjectPriority } from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

// 通用请求函数
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API请求失败 ${endpoint}:`, error);
    throw error;
  }
}

// 用户相关API
export const userApi = {
  // 获取所有用户
  fetchUsers: (): Promise<User[]> => 
    apiRequest<User[]>('/users'),

  // 用户登录
  login: (userId: string): Promise<User> =>
    apiRequest<User>('/login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

// OKR相关API
export const okrApi = {
  // 获取所有OKR集合
  fetchOKRSets: (): Promise<OKRSet[]> =>
    apiRequest<OKRSet[]>('/okr-sets'),

  // 创建新OKR周期
  createOKRSet: (periodId: string, periodName: string): Promise<OKRSet> =>
    apiRequest<OKRSet>('/okr-sets', {
      method: 'POST',
      body: JSON.stringify({ periodId, periodName }),
    }),

  // 更新OKR周期
  updateOKRSet: (periodId: string, okrs: any[]): Promise<OKRSet> =>
    apiRequest<OKRSet>(`/okr-sets/${periodId}`, {
      method: 'PUT',
      body: JSON.stringify({ okrs }),
    }),
};

// 项目相关API
export const projectApi = {
  // 获取所有项目
  fetchProjects: (): Promise<Project[]> =>
    apiRequest<Project[]>('/projects'),

  // 创建新项目
  createProject: (projectData: Partial<Project>): Promise<Project> =>
    apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  // 更新项目
  updateProject: (id: string, updateData: Partial<Project>): Promise<Project> =>
    apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  // 删除项目
  deleteProject: (id: string): Promise<{ message: string; id: string }> =>
    apiRequest<{ message: string; id: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// 导出所有API
export const api = {
  ...userApi,
  ...okrApi,
  ...projectApi,
};

export default api;