import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoCalendarView } from './TodoCalendarView';
import type { TodoWithStatus } from '../../../entities/todo/model/types';

const baseTodo: TodoWithStatus = {
  id: 't1',
  userId: 'u1',
  categoryId: 'c1',
  title: '알고리즘 과제',
  description: null,
  startDate: '2026-08-27',
  endDate: '2026-08-27',
  isDone: false,
  completedAt: null,
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
  status: 'IN_PROGRESS',
};

function renderCalendar(todos: TodoWithStatus[]) {
  return render(
    <MemoryRouter>
      <TodoCalendarView todos={todos} />
    </MemoryRouter>,
  );
}

describe('TodoCalendarView', () => {
  it('현재 달의 달력 그리드를 렌더링한다', () => {
    renderCalendar([]);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('할일의 시작일~종료일 사이 날짜 셀에 제목이 표시된다', () => {
    renderCalendar([baseTodo]);
    expect(screen.getByText('알고리즘 과제')).toBeInTheDocument();
  });

  it('기간이 여러 날에 걸치면 각 날짜 셀마다 표시된다', () => {
    renderCalendar([{ ...baseTodo, startDate: '2026-08-25', endDate: '2026-08-27' }]);
    expect(screen.getAllByText('알고리즘 과제')).toHaveLength(3);
  });

  it('한 날짜에 4개 넘게 있으면 3개만 보이고 나머지는 +N으로 표시된다', () => {
    const todos = Array.from({ length: 5 }, (_, i) => ({
      ...baseTodo,
      id: `t${i}`,
      title: `할일${i}`,
    }));
    renderCalendar(todos);

    expect(screen.getByText('할일0')).toBeInTheDocument();
    expect(screen.getByText('할일2')).toBeInTheDocument();
    expect(screen.queryByText('할일3')).not.toBeInTheDocument();
    expect(screen.getByText('+2개')).toBeInTheDocument();
  });

  it('다음 달 버튼 클릭 시 표시되는 월이 바뀐다', () => {
    renderCalendar([]);
    const before = screen.getByText(/\d{4}/).textContent;
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
    const after = screen.getByText(/\d{4}/).textContent;
    expect(after).not.toBe(before);
  });
});
