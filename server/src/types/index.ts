export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Article {
  id: number;
  user_id: number;
  url: string;
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  tags: string;
  is_read: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateArticleRequest {
  url: string;
  tags?: string[];
}

export interface UpdateArticleRequest {
  is_read?: boolean;
  is_favorite?: boolean;
  tags?: string[];
} 