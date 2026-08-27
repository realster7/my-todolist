import { useQuery } from '@tanstack/react-query';
import { fetchTodos, type FetchTodosParams } from './todoApi';

export function useTodos(params?: FetchTodosParams) {
  return useQuery({
    queryKey: ['todos', params ?? {}],
    queryFn: () => fetchTodos(params),
  });
}
