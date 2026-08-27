import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { useAuthStore } from '../../../entities/user/model/authStore';

const mockUser = {
  id: 'u1',
  email: 'a@example.com',
  name: '기존이름',
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.setState({ accessToken: null, user: null });
});

describe('ProfilePage', () => {
  it('로그인된 사용자 정보로 폼을 프리필해서 보여준다', () => {
    useAuthStore.setState({ accessToken: 'token', user: mockUser });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('내 정보 수정')).toBeInTheDocument();
    expect((screen.getByLabelText('이메일') as HTMLInputElement).value).toBe('a@example.com');
  });

  it('user가 없으면 아무것도 렌더링하지 않는다', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('내 정보 수정')).not.toBeInTheDocument();
  });
});
