import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import type { TodoStatus } from '../model/types';

describe('StatusBadge', () => {
  it.each([
    ['NOT_STARTED', '시작전', 'status-badge--not-started'],
    ['IN_PROGRESS', '진행중', 'status-badge--in-progress'],
    ['DONE', '완료', 'status-badge--done'],
    ['OVERDUE', '지연', 'status-badge--overdue'],
  ] as [TodoStatus, string, string][])('status=%s 이면 라벨 "%s" 와 className "%s" 을 렌더링한다', (status, label, className) => {
    render(<StatusBadge status={status} />);

    const badge = screen.getByText(label);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(className);
  });
});
