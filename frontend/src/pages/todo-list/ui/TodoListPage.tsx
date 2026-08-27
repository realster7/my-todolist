import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../../shared/ui/Header';
import { useAuthStore } from '../../../entities/user/model/authStore';
import { useTodos } from '../../../entities/todo/api/useTodos';
import { useCategories } from '../../../entities/category/api/useCategories';
import { TodoListItem } from '../../../entities/todo/ui/TodoListItem';
import { TodoFilterBar } from '../../../features/filter-todos/ui/TodoFilterBar';
import { useTodoFilter } from '../../../features/filter-todos/model/useTodoFilter';
import { TodoCalendarView } from '../../../features/calendar-view/ui/TodoCalendarView';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './TodoListPage.css';

type ViewMode = 'list' | 'calendar';

export function TodoListPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, logout } = useAuthStore();
  const { category, status, setCategory, setStatus } = useTodoFilter();
  const { data: todos } = useTodos({ category, status });
  const { data: allTodos } = useTodos();
  const { data: categories } = useCategories();
  const [view, setView] = useState<ViewMode>('list');

  const inProgressCount = allTodos?.filter((todo) => todo.status === 'IN_PROGRESS').length ?? 0;
  const overdueCount = allTodos?.filter((todo) => todo.status === 'OVERDUE').length ?? 0;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const categoryNameOf = (categoryId: string) => categories?.find((c) => c.id === categoryId)?.name ?? '';

  return (
    <div>
      <Header userEmail={user?.email} onLogout={handleLogout} />
      <div className="todo-list-page">
        <div className="todo-list-page__top">
          <div className="todo-list-page__hero">
            <p className="todo-list-page__greeting">{t('todoList.greeting')}</p>
            <p className="todo-list-page__summary">
              {t('todoList.summary', { inProgress: inProgressCount, overdue: overdueCount })}
            </p>
          </div>
          <Link to="/todos/new" className="todo-list-page__add-button">
            {t('todoList.addButton')}
          </Link>
        </div>
        <div className="todo-list-page__toolbar">
          <TodoFilterBar
            category={category}
            status={status}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
          />
          <div className="todo-list-page__view-toggle" role="group">
            <button
              type="button"
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              {t('todoList.viewList')}
            </button>
            <button
              type="button"
              className={view === 'calendar' ? 'active' : ''}
              onClick={() => setView('calendar')}
            >
              {t('todoList.viewCalendar')}
            </button>
          </div>
        </div>
        {view === 'list' ? (
          <>
            {todos && todos.length === 0 && <p>{t('todoList.empty')}</p>}
            <div className="todo-list-page__items">
              {todos?.map((todo) => (
                <TodoListItem key={todo.id} todo={todo} categoryName={categoryNameOf(todo.categoryId)} />
              ))}
            </div>
          </>
        ) : (
          <TodoCalendarView todos={todos ?? []} />
        )}
      </div>
    </div>
  );
}
