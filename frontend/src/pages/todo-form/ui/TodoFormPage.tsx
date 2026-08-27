import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { TodoForm } from '../../../features/create-todo/ui/TodoForm';
import { EditTodoForm } from '../../../features/edit-todo/ui/EditTodoForm';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import type { TodoWithStatus } from '../../../entities/todo/model/types';
import './TodoFormPage.css';

export function TodoFormPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { t } = useLocale();

  if (!id) {
    return (
      <div className="todo-form-page">
        <div className="todo-form-page__card">
          <h1 className="todo-form-page__title">{t('todoForm.newTitle')}</h1>
          <TodoForm />
        </div>
      </div>
    );
  }

  const todo = queryClient
    .getQueriesData<TodoWithStatus[]>({ queryKey: ['todos'] })
    .flatMap(([, data]) => data ?? [])
    .find((item) => item.id === id);

  return (
    <div className="todo-form-page">
      <div className="todo-form-page__card">
        <h1 className="todo-form-page__title">{t('todoForm.editTitle')}</h1>
        {todo ? (
          <EditTodoForm todo={todo} />
        ) : (
          <p>
            {t('todoForm.notFound')} <a href="/todos">{t('todoForm.backToList')}</a>
          </p>
        )}
      </div>
    </div>
  );
}
