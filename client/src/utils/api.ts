import axios from 'axios';
import { Article, AuthResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
};

export const articlesAPI = {
  getArticles: (params?: {
    search?: string;
    tags?: string;
    is_read?: boolean;
    is_favorite?: boolean;
  }) => api.get<Article[]>('/articles', { params }),
  
  addArticle: (url: string, tags?: string[]) =>
    api.post<Article>('/articles', { url, tags }),
  
  updateArticle: (id: number, data: {
    is_read?: boolean;
    is_favorite?: boolean;
    tags?: string[];
  }) => api.put<Article>(`/articles/${id}`, data),
  
  deleteArticle: (id: number) =>
    api.delete(`/articles/${id}`),
};

export default api; 