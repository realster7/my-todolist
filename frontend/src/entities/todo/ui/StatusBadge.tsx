import type { TodoStatus } from '../model/types';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import type { TranslationKey } from '../../../shared/lib/i18n/translations';
import './StatusBadge.css';

const LABEL_KEY: Record<TodoStatus, TranslationKey> = {
  NOT_STARTED: 'status.notStarted',
  IN_PROGRESS: 'status.inProgress',
  DONE: 'status.done',
  OVERDUE: 'status.overdue',
};

const MODIFIER: Record<TodoStatus, string> = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  OVERDUE: 'overdue',
};

export function StatusBadge({ status }: { status: TodoStatus }) {
  const { t } = useLocale();
  return <span className={`status-badge status-badge--${MODIFIER[status]}`}>{t(LABEL_KEY[status])}</span>;
}
