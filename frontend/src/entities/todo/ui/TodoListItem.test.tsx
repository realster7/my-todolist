import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoListItem } from './TodoListItem';
import type { TodoWithStatus } from '../model/types';

function renderItem(props: React.ComponentProps<typeof TodoListItem>) {
  return render(
    <MemoryRouter>
      <TodoListItem {...props} />
    </MemoryRouter>,
  );
}

const baseTodo: TodoWithStatus = {
  id: 't1',
  userId: 'u1',
  categoryId: 'c1',
  title: '알고리즘 과제',
  description: null,
  startDate: '2026-09-01',
  endDate: '2026-09-07',
  isDone: false,
  completedAt: null,
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
  status: 'IN_PROGRESS',
};

describe('TodoListItem', () => {
  it('제목/카테고리명/기간을 렌더링한다', () => {
    renderItem({ todo: baseTodo, categoryName: '기본' });

    expect(screen.getByText('알고리즘 과제')).toBeInTheDocument();
    expect(screen.getByText('기본')).toBeInTheDocument();
    expect(screen.getByText('2026-09-01 ~ 2026-09-07')).toBeInTheDocument();
  });

  it('상태 뱃지 라벨을 렌더링한다', () => {
    renderItem({ todo: baseTodo, categoryName: '기본' });

    expect(screen.getByText('진행중')).toBeInTheDocument();
  });

  it('isDone이 true인 할일은 체크박스가 checked 상태로 렌더링된다', () => {
    renderItem({ todo: { ...baseTodo, isDone: true }, categoryName: '기본' });

    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
