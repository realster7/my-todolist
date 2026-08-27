import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TodoWithStatus } from '../../../entities/todo/model/types';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './TodoCalendarView.css';

interface TodoCalendarViewProps {
  todos: TodoWithStatus[];
}

const INTL_LOCALE: Record<string, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
const MAX_VISIBLE = 3;
const STATUS_MODIFIER: Record<TodoWithStatus['status'], string> = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  OVERDUE: 'overdue',
};

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 월요일 시작이 아닌 일요일 시작 그리드(달력 관용 표기), 앞뒤 달 날짜로 6주(42칸) 채움.
function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function TodoCalendarView({ todos }: TodoCalendarViewProps) {
  const { locale, t } = useLocale();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const intlLocale = INTL_LOCALE[locale] ?? 'ko-KR';
  const monthLabel = new Intl.DateTimeFormat(intlLocale, { year: 'numeric', month: 'long' }).format(cursor);
  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(new Date(2026, 7, 23 + i)),
  );

  const days = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const todayStr = formatDate(today);

  function todosOn(dateStr: string): TodoWithStatus[] {
    return todos.filter((todo) => todo.startDate <= dateStr && dateStr <= todo.endDate);
  }

  return (
    <div className="todo-calendar">
      <div className="todo-calendar__header">
        <button
          type="button"
          className="todo-calendar__nav"
          aria-label={t('calendar.prevMonth')}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <span className="todo-calendar__month-label">{monthLabel}</span>
        <button
          type="button"
          className="todo-calendar__nav"
          aria-label={t('calendar.nextMonth')}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="todo-calendar__weekdays">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="todo-calendar__grid">
        {days.map((day) => {
          const dateStr = formatDate(day);
          const dayTodos = todosOn(dateStr);
          const outside = day.getMonth() !== cursor.getMonth();
          return (
            <div
              key={dateStr}
              className={[
                'todo-calendar__day',
                outside && 'todo-calendar__day--outside',
                dateStr === todayStr && 'todo-calendar__day--today',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="todo-calendar__day-number">{day.getDate()}</span>
              <div className="todo-calendar__day-todos">
                {dayTodos.slice(0, MAX_VISIBLE).map((todo) => (
                  <Link
                    key={todo.id}
                    to={`/todos/${todo.id}/edit`}
                    className={`todo-calendar__todo todo-calendar__todo--${STATUS_MODIFIER[todo.status]}`}
                  >
                    {todo.title}
                  </Link>
                ))}
                {dayTodos.length > MAX_VISIBLE && (
                  <span className="todo-calendar__more">{t('calendar.moreCount', { count: dayTodos.length - MAX_VISIBLE })}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
