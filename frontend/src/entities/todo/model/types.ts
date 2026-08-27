export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';

export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isDone: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoWithStatus extends Todo {
  status: TodoStatus;
}
