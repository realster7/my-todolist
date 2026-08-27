import type { TodoStatus } from '../model/types';
import './StatusBadge.css';

const LABELS: Record<TodoStatus, string> = {
  NOT_STARTED: '시작전',
  IN_PROGRESS: '진행중',
  DONE: '완료',
  OVERDUE: '지연',
};

const MODIFIER: Record<TodoStatus, string> = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  OVERDUE: 'overdue',
};

export function StatusBadge({ status }: { status: TodoStatus }) {
  return <span className={`status-badge status-badge--${MODIFIER[status]}`}>{LABELS[status]}</span>;
}
