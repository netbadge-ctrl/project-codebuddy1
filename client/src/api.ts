import axios from 'axios';
import { User, OkrSet, Project } from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // The backend server URL
});

// --- User APIs ---
export const fetchUsers = (): Promise<User[]> => apiClient.get('/users').then(res => res.data);

export const login = (userId: string): Promise<User> => apiClient.post('/login', { userId }).then(res => res.data);

// --- OKR APIs ---
export const fetchOkrSets = (): Promise<OkrSet[]> => apiClient.get('/okr-sets').then(res => res.data);

export const createOkrSet = (data: { periodId: string; periodName: string }): Promise<OkrSet> =>
  apiClient.post('/okr-sets', data).then(res => res.data);

export const updateOkrSet = (periodId: string, data: OkrSet): Promise<OkrSet> =>
  apiClient.put(`/okr-sets/${periodId}`, data).then(res => res.data);

// --- Project APIs ---
export const fetchProjects = (): Promise<Project[]> => apiClient.get('/projects').then(res => res.data);

export const createProject = (project: Omit<Project, 'id' | 'changeLog' | 'comments'>): Promise<Project> =>
  apiClient.post('/projects', project).then(res => res.data);

export const updateProject = (id: string, project: Partial<Project>): Promise<Project> =>
  apiClient.put(`/projects/${id}`, project).then(res => res.data);

export const deleteProject = (id: string): Promise<{ success: boolean }> =>
  apiClient.delete(`/projects/${id}`).then(res => res.data);

export default {
  fetchUsers,
  login,
  fetchOkrSets,
  createOkrSet,
  updateOkrSet,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
};