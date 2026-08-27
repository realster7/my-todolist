import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from './categoryApi';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}
