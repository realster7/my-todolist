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
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import type { TodoWithStatus } from '../../../entities/todo/model/types';
import './EditTodoForm.css';

interface EditTodoFormProps {
  todo: TodoWithStatus;
}

export function EditTodoForm({ todo }: EditTodoFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLocale();
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
      setFormError(t('todoForm.requiredError'));
      return;
    }

    if (endDate < startDate) {
      setFormError(t('todoForm.dateOrderError'));
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
        setFormError(t('todoForm.editGenericError'));
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
      setDeleteError(isApiError(err) ? err.message : t('todoForm.deleteGenericError'));
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
        label={t('field.title')}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        label={t('field.description')}
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label={t('field.startDate')}
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <Input
        label={t('field.endDate')}
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />
      <CategorySelect value={categoryId} onChange={setCategoryId} />
      <label className="edit-todo-form__done">
        <input type="checkbox" checked={isDone} onChange={(e) => setIsDone(e.target.checked)} />
        {t('todoForm.done')}
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {t('todoForm.editSubmit')}
      </Button>
      <Button type="button" variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
        {t('todoForm.delete')}
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
