// src/api/projects.ts
import api from './axios';

export interface Project {
  id: number;
  team_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export const getProjects = async (teamId: number): Promise<Project[]> => {
  const response = await api.get(`/teams/${teamId}/projects`);
  return response.data;
};

export const createProject = async (
  teamId: number,
  name: string,
  description?: string
): Promise<Project> => {
  const response = await api.post(`/teams/${teamId}/projects`, {
    name,
    description,
  });
  return response.data;
};