import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

function renderHeader(props?: Parameters<typeof Header>[0]) {
  return render(
    <MemoryRouter>
      <Header {...props} />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('does not show 로그아웃 when userEmail is absent', () => {
    renderHeader();
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
  });

  it('shows 내 정보 and 로그아웃 when userEmail is present', () => {
    renderHeader({ userEmail: 'a@b.com' });
    expect(screen.getByText('내 정보')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('로고는 /todos로 이동한다', () => {
    renderHeader();
    expect(screen.getByText('하루하루 일정 관리')).toHaveAttribute('href', '/todos');
  });

  it('내 정보 링크는 /profile로 이동한다', () => {
    renderHeader({ userEmail: 'a@b.com' });
    expect(screen.getByText('내 정보')).toHaveAttribute('href', '/profile');
  });

  it('calls onLogout when 로그아웃 is clicked', () => {
    const onLogout = vi.fn();
    renderHeader({ userEmail: 'a@b.com', onLogout });
    fireEvent.click(screen.getByText('로그아웃'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('toggles data-theme and persists the choice when clicked', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: '다크 모드로 전환' });

    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: '라이트 모드로 전환' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
