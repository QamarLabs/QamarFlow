import { http } from '@/shared/api/http';
import type { AuthResponse, Credentials, RegisterInput, User } from '../model/types';

export const authApi = {
  login: (body: Credentials) => http.post<AuthResponse>('/auth/login', body, false),
  register: (body: RegisterInput) => http.post<AuthResponse>('/auth/register', body, false),
  logout: () => http.post<void>('/auth/logout', undefined, false),
  me: async () => (await http.get<{ user: User }>('/auth/me')).user
};
