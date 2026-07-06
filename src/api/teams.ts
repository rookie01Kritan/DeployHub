// src/api/teams.ts
import api from './axios';

export interface Team {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  role: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export const getMyTeams = async (): Promise<Team[]> => {
  const response = await api.get('/teams');
  return response.data;
};

export const createTeam = async (name: string): Promise<Team> => {
  const response = await api.post('/teams', { name });
  return response.data;
};

export const getTeamMembers = async (teamId: number): Promise<TeamMember[]> => {
  const response = await api.get(`/teams/${teamId}/members`);
  return response.data;
};

export const inviteMember = async (
  teamId: number,
  email: string
): Promise<TeamMember> => {
  const response = await api.post(`/teams/${teamId}/members`, { email });
  return response.data;
};