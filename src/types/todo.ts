export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: PriorityLevel;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoDTO {
  title: string;
  description?: string;
  priority?: PriorityLevel;
}

export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  is_completed?: boolean;
}

export type TodoFilterStatus = 'all' | 'pending' | 'completed';

export interface TodoFilter {
  status: TodoFilterStatus;
  searchQuery?: string;
  priority?: PriorityLevel | 'all';
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}
