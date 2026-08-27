import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { CategorySelect } from '../../../entities/category/ui/CategorySelect';
import { createTodo } from '../api/createTodo';
import { isApiError } from '../../../shared/lib/apiError';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './TodoForm.css';

export function TodoForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createTodo({
        title,
        description: description || null,
        startDate,
        endDate,
        categoryId: categoryId || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      navigate('/todos');
    } catch (err) {
      if (isApiError(err)) {
        setFormError(err.message);
      } else {
        setFormError(t('todoForm.createGenericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form" noValidate>
      {formError && (
        <p className="todo-form__error" role="alert">
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
      <Button type="submit" disabled={isSubmitting}>
        {t('todoForm.createSubmit')}
      </Button>
    </form>
  );
}
