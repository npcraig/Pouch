export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Article {
  id: number;
  user_id: number;
  url: string;
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  tags: string[];
  is_read: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  error: string;
} 