import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { CategorySelect } from '../../../entities/category/ui/CategorySelect';
import { createTodo } from '../api/createTodo';
import { isApiError } from '../../../shared/lib/apiError';
import './TodoForm.css';

export function TodoForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      setFormError('제목/시작일/종료일을 입력해주세요.');
      return;
    }

    if (endDate < startDate) {
      setFormError('종료일은 시작일보다 빠를 수 없습니다.');
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
        setFormError('할일 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
      <Button type="submit" disabled={isSubmitting}>
        등록하기
      </Button>
    </form>
  );
}
