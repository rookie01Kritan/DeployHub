import api from './axios';
import { Module, ModuleWithLessons, Lesson } from '../types';

export const getModules = async (teamId: number): Promise<Module[]> => {
  const response = await api.get(`/teams/${teamId}/modules`);
  return response.data;
};

export const createModule = async (
  teamId: number,
  title: string,
  description?: string
): Promise<Module> => {
  const response = await api.post(`/teams/${teamId}/modules`, {
    title,
    description,
  });
  return response.data;
};

export const getModule = async (
  teamId: number,
  moduleId: number
): Promise<ModuleWithLessons> => {
  const response = await api.get(`/teams/${teamId}/modules/${moduleId}`);
  return response.data;
};

export const createLesson = async (
  teamId: number,
  moduleId: number,
  title: string,
  content: string
): Promise<Lesson> => {
  const response = await api.post(
    `/teams/${teamId}/modules/${moduleId}/lessons`,
    { title, content }
  );
  return response.data;
};

export const updateLesson = async (
  teamId: number,
  moduleId: number,
  lessonId: number,
  updates: Partial<Pick<Lesson, 'title' | 'content'>>
): Promise<Lesson> => {
  const response = await api.patch(
    `/teams/${teamId}/modules/${moduleId}/lessons/${lessonId}`,
    updates
  );
  return response.data;
};

export const deleteLesson = async (
  teamId: number,
  moduleId: number,
  lessonId: number
): Promise<void> => {
  await api.delete(`/teams/${teamId}/modules/${moduleId}/lessons/${lessonId}`);
};