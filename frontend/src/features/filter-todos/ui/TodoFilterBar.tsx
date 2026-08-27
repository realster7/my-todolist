import { useCategories } from '../../../entities/category/api/useCategories';
import type { TodoStatus } from '../../../entities/todo/model/types';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import type { TranslationKey } from '../../../shared/lib/i18n/translations';
import './TodoFilterBar.css';

const STATUS_OPTIONS: { value: TodoStatus | undefined; labelKey: TranslationKey }[] = [
  { value: undefined, labelKey: 'status.all' },
  { value: 'NOT_STARTED', labelKey: 'status.notStarted' },
  { value: 'IN_PROGRESS', labelKey: 'status.inProgress' },
  { value: 'DONE', labelKey: 'status.done' },
  { value: 'OVERDUE', labelKey: 'status.overdue' },
];

interface TodoFilterBarProps {
  category: string | undefined;
  status: TodoStatus | undefined;
  onCategoryChange: (v: string | undefined) => void;
  onStatusChange: (v: TodoStatus | undefined) => void;
}

export function TodoFilterBar({ category, status, onCategoryChange, onStatusChange }: TodoFilterBarProps) {
  const { data: categories } = useCategories();
  const { t } = useLocale();

  return (
    <div className="todo-filter-bar">
      <label className="todo-filter-bar__category">
        {t('field.category')}
        <select value={category ?? ''} onChange={(e) => onCategoryChange(e.target.value || undefined)}>
          <option value="">{t('status.all')}</option>
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
            key={opt.labelKey}
            type="button"
            className={status === opt.value ? 'active' : ''}
            onClick={() => onStatusChange(opt.value)}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
