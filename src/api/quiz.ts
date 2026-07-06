import api from './axios';
import { Quiz, Question, QuestionOption, QuizAttemptResult } from '../types';

export const getQuiz = async (teamId: number, moduleId: number): Promise<Quiz> => {
  const response = await api.get(`/teams/${teamId}/modules/${moduleId}/quiz`);
  return response.data;
};

export const createQuiz = async (
  teamId: number,
  moduleId: number,
  title: string
): Promise<Quiz> => {
  const response = await api.post(`/teams/${teamId}/modules/${moduleId}/quiz`, {
    title,
  });
  return response.data;
};

export const createQuestion = async (
  teamId: number,
  moduleId: number,
  questionText: string
): Promise<Question> => {
  const response = await api.post(
    `/teams/${teamId}/modules/${moduleId}/quiz/questions`,
    { questionText }
  );
  return response.data;
};

export const createOption = async (
  teamId: number,
  moduleId: number,
  questionId: number,
  optionText: string,
  isCorrect: boolean
): Promise<QuestionOption> => {
  const response = await api.post(
    `/teams/${teamId}/modules/${moduleId}/quiz/questions/${questionId}/options`,
    { optionText, isCorrect }
  );
  return response.data;
};

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  completed_at: string;
}

export const submitAttempt = async (
  teamId: number,
  moduleId: number,
  answers: { questionId: number; optionId: number }[]
): Promise<QuizAttemptResult> => {
  const response = await api.post(
    `/teams/${teamId}/modules/${moduleId}/quiz/attempt`,
    { answers }
  );
  return response.data;
};