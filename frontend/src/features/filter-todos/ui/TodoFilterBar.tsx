import { useCategories } from '../../../entities/category/api/useCategories';
import type { TodoStatus } from '../../../entities/todo/model/types';
import './TodoFilterBar.css';

const STATUS_OPTIONS: { value: TodoStatus | undefined; label: string }[] = [
  { value: undefined, label: '전체' },
  { value: 'NOT_STARTED', label: '시작전' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'DONE', label: '완료' },
  { value: 'OVERDUE', label: '지연' },
];

interface TodoFilterBarProps {
  category: string | undefined;
  status: TodoStatus | undefined;
  onCategoryChange: (v: string | undefined) => void;
  onStatusChange: (v: TodoStatus | undefined) => void;
}

export function TodoFilterBar({ category, status, onCategoryChange, onStatusChange }: TodoFilterBarProps) {
  const { data: categories } = useCategories();

  return (
    <div className="todo-filter-bar">
      <label className="todo-filter-bar__category">
        카테고리
        <select value={category ?? ''} onChange={(e) => onCategoryChange(e.target.value || undefined)}>
          <option value="">전체</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="todo-filter-bar__status-group">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            className={status === opt.value ? 'active' : ''}
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
