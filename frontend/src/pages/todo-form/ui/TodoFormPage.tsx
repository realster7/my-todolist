import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { TodoForm } from '../../../features/create-todo/ui/TodoForm';
import { EditTodoForm } from '../../../features/edit-todo/ui/EditTodoForm';
import type { TodoWithStatus } from '../../../entities/todo/model/types';
import './TodoFormPage.css';

export function TodoFormPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  if (!id) {
    return (
      <div className="todo-form-page">
        <div className="todo-form-page__card">
          <h1 className="todo-form-page__title">새 할일 등록</h1>
          <TodoForm />
        </div>
      </div>
    );
  }

  const todo = queryClient
    .getQueriesData<TodoWithStatus[]>({ queryKey: ['todos'] })
    .flatMap(([, data]) => data ?? [])
    .find((t) => t.id === id);

  return (
    <div className="todo-form-page">
      <div className="todo-form-page__card">
        <h1 className="todo-form-page__title">할일 편집</h1>
        {todo ? (
          <EditTodoForm todo={todo} />
        ) : (
          <p>
            할일을 찾을 수 없습니다. <a href="/todos">목록으로 돌아가기</a>
          </p>
        )}
      </div>
    </div>
  );
}
