import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { CategorySelect } from '../../../entities/category/ui/CategorySelect';
import { updateTodo } from '../api/updateTodo';
import { deleteTodo } from '../../delete-todo/api/deleteTodo';
import { DeleteConfirmModal } from '../../delete-todo/ui/DeleteConfirmModal';
import { isApiError } from '../../../shared/lib/apiError';
import type { TodoWithStatus } from '../../../entities/todo/model/types';
import './EditTodoForm.css';

interface EditTodoFormProps {
  todo: TodoWithStatus;
}

export function EditTodoForm({ todo }: EditTodoFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [startDate, setStartDate] = useState(todo.startDate);
  const [endDate, setEndDate] = useState(todo.endDate);
  const [categoryId, setCategoryId] = useState(todo.categoryId);
  const [isDone, setIsDone] = useState(todo.isDone);
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(undefined);

    if (!title || !startDate || !endDate) {
      setFormError('제목/시작일/종료일을 입력해주세요.');
      return;
    }

    if (endDate < startDate) {
      setFormError('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTodo(todo.id, {
        title,
        description: description || null,
        startDate,
        endDate,
        categoryId: categoryId || undefined,
        isDone,
      });
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      navigate('/todos');
    } catch (err) {
      if (isApiError(err)) {
        setFormError(err.message);
      } else {
        setFormError('할일 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteTodo(todo.id);
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      navigate('/todos');
    } catch (err) {
      setDeleteError(isApiError(err) ? err.message : '삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="edit-todo-form" noValidate>
      {formError && (
        <p className="edit-todo-form__error" role="alert">
          {formError}
        </p>
      )}
      <Input
        label="제목"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        label="설명"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="시작일"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <Input
        label="종료일"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />
      <CategorySelect value={categoryId} onChange={setCategoryId} />
      <label className="edit-todo-form__done">
        <input type="checkbox" checked={isDone} onChange={(e) => setIsDone(e.target.checked)} />
        완료 처리
      </label>
      <Button type="submit" disabled={isSubmitting}>
        저장하기
      </Button>
      <Button type="button" variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
        삭제
      </Button>
    </form>
    <DeleteConfirmModal
      open={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={handleDelete}
      todoTitle={todo.title}
      isDeleting={isDeleting}
      error={deleteError}
    />
    </>
  );
}
