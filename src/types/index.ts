export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  role?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface Project {
  id: number;
  team_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  assignee_id: number | null;
  assignee_name: string | null;
  assignee_email: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Module {
  id: number;
  team_id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content: string | null;
  order_index: number;
  created_at: string;
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  created_at: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  order_index: number;
  created_at: string;
  options: QuestionOption[];
}

export interface Quiz {
  id: number;
  module_id: number;
  title: string;
  created_at: string;
  questions: Question[];
}

export interface QuizAttemptResult {
  id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  completed_at: string;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
}