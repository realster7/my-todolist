import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('does not show 로그아웃 when userEmail is absent', () => {
    render(<Header />);
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
  });

  it('shows 내 정보 and 로그아웃 when userEmail is present', () => {
    render(<Header userEmail="a@b.com" />);
    expect(screen.getByText('내 정보')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('calls onLogout when 로그아웃 is clicked', () => {
    const onLogout = vi.fn();
    render(<Header userEmail="a@b.com" onLogout={onLogout} />);
    fireEvent.click(screen.getByText('로그아웃'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
