import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../../shared/ui/Header';
import { useAuthStore } from '../../../entities/user/model/authStore';
import { useTodos } from '../../../entities/todo/api/useTodos';
import { useCategories } from '../../../entities/category/api/useCategories';
import { TodoListItem } from '../../../entities/todo/ui/TodoListItem';
import { TodoFilterBar } from '../../../features/filter-todos/ui/TodoFilterBar';
import { useTodoFilter } from '../../../features/filter-todos/model/useTodoFilter';
import './TodoListPage.css';

export function TodoListPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { category, status, setCategory, setStatus } = useTodoFilter();
  const { data: todos } = useTodos({ category, status });
  const { data: categories } = useCategories();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const categoryNameOf = (categoryId: string) => categories?.find((c) => c.id === categoryId)?.name ?? '';

  return (
    <div>
      <Header userEmail={user?.email} onLogout={handleLogout} />
      <div className="todo-list-page">
        <Link to="/todos/new" className="todo-list-page__add-button">
          + 할일 추가
        </Link>
        <TodoFilterBar
          category={category}
          status={status}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
        />
        {todos && todos.length === 0 && <p>등록된 할일이 없습니다. 새 할일을 추가해 보세요.</p>}
        <div className="todo-list-page__items">
          {todos?.map((todo) => (
            <TodoListItem key={todo.id} todo={todo} categoryName={categoryNameOf(todo.categoryId)} />
          ))}
        </div>
      </div>
    </div>
  );
}
