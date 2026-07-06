import api from './axios';

interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
  token: string;
}

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
};