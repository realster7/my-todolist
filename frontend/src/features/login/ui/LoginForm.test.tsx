import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '../../../entities/user/model/authStore';

afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.setState({ accessToken: null, user: null });
});

function renderLoginForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/todos" element={<div>할일 목록 화면</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText(/이메일/), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText(/비밀번호/), { target: { value: 'password123' } });
}

const dummyUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
};

describe('LoginForm', () => {
  it('입력값을 채워 제출하면 올바른 body로 로그인 요청을 보낸다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ accessToken: 'token-1', user: dummyUser }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderLoginForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /로그인/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('로그인 성공 시 할일 목록 화면으로 이동한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ accessToken: 'token-1', user: dummyUser }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderLoginForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /로그인/ }));

    expect(await screen.findByText('할일 목록 화면')).toBeInTheDocument();
  });

  it('로그인 성공 시 authStore에 accessToken/user가 반영된다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ accessToken: 'token-1', user: dummyUser }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderLoginForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /로그인/ }));

    await screen.findByText('할일 목록 화면');
    expect(useAuthStore.getState().accessToken).toBe('token-1');
    expect(useAuthStore.getState().user).toEqual(dummyUser);
  });

  it('이메일/비밀번호 불일치(401) 응답이면 에러 메시지를 화면에 보여준다', async () => {
    const errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: errorMessage } }), {
        status: 401,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderLoginForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /로그인/ }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('네트워크 에러 등 API 에러 형태가 아니면 기본 실패 메시지를 보여준다', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    renderLoginForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /로그인/ }));

    expect(
      await screen.findByText('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'),
    ).toBeInTheDocument();
  });
});
