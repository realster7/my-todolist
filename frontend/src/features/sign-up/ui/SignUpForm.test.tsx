import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SignUpForm } from './SignUpForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderSignUpForm() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<div>로그인 화면</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText(/이메일/), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText(/비밀번호/), { target: { value: 'password123' } });
  fireEvent.change(screen.getByLabelText(/이름/), { target: { value: '홍길동' } });
}

describe('SignUpForm', () => {
  it('입력값을 채워 제출하면 올바른 body로 회원가입 요청을 보낸다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: '홍길동',
          createdAt: '2026-08-27T00:00:00.000Z',
          updatedAt: '2026-08-27T00:00:00.000Z',
        }),
        { status: 201 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderSignUpForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /가입|회원가입/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
    });
  });

  it('회원가입 성공 시 로그인 화면으로 이동한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: '홍길동',
          createdAt: '2026-08-27T00:00:00.000Z',
          updatedAt: '2026-08-27T00:00:00.000Z',
        }),
        { status: 201 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderSignUpForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /가입|회원가입/ }));

    expect(await screen.findByText('로그인 화면')).toBeInTheDocument();
  });

  it('이메일 중복(409) 응답이면 에러 메시지를 화면에 보여준다', async () => {
    const errorMessage = '이미 가입된 이메일입니다.';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'DUPLICATE_EMAIL', message: errorMessage } }), {
        status: 409,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderSignUpForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /가입|회원가입/ }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('400 등 그 외 API 에러는 폼 상단에 서버 메시지를 보여준다', async () => {
    const errorMessage = '유효한 이메일을 입력해주세요.';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: errorMessage } }), {
        status: 400,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderSignUpForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /가입|회원가입/ }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('네트워크 에러 등 API 에러 형태가 아니면 기본 실패 메시지를 보여준다', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    renderSignUpForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /가입|회원가입/ }));

    expect(
      await screen.findByText('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'),
    ).toBeInTheDocument();
  });
});
