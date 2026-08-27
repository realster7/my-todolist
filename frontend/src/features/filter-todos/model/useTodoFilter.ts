import { useState } from 'react';
import type { TodoStatus } from '../../../entities/todo/model/types';

export function useTodoFilter() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TodoStatus | undefined>(undefined);
  return { category, setCategory, status, setStatus };
}
