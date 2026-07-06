import api from './axios';
import { Task } from '../types';

export const getTasks = async (teamId: number, projectId: number): Promise<Task[]> => {
  const response = await api.get(`/teams/${teamId}/projects/${projectId}/tasks`);
  return response.data;
};

export const createTask = async (
  teamId: number,
  projectId: number,
  title: string,
  description?: string,
  assigneeId?: number
): Promise<Task> => {
  const response = await api.post(`/teams/${teamId}/projects/${projectId}/tasks`, {
    title,
    description,
    assigneeId,
  });
  return response.data;
};

export const updateTask = async (
  teamId: number,
  projectId: number,
  taskId: number,
  updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'assignee_id'>>
): Promise<Task> => {
  const response = await api.patch(
    `/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
    updates
  );
  return response.data;
};

export const deleteTask = async (
  teamId: number,
  projectId: number,
  taskId: number
): Promise<void> => {
  await api.delete(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`);
};