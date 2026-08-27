import { Link } from 'react-router-dom';
import type { TodoWithStatus } from '../model/types';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from '../../category/ui/CategoryBadge';
import './TodoListItem.css';

interface TodoListItemProps {
  todo: TodoWithStatus;
  categoryName: string;
}

export function TodoListItem({ todo, categoryName }: TodoListItemProps) {
  return (
    <div className="todo-list-item">
      <input type="checkbox" checked={todo.isDone} disabled readOnly />
      <Link to={`/todos/${todo.id}/edit`} className="todo-list-item__link">
        <span className={`todo-list-item__title${todo.isDone ? ' todo-list-item__title--done' : ''}`}>
          {todo.title}
        </span>
        <CategoryBadge name={categoryName} />
        <span className="todo-list-item__period">
          {todo.startDate} ~ {todo.endDate}
        </span>
        <StatusBadge status={todo.status} />
      </Link>
    </div>
  );
}
