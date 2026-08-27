import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EditProfileForm } from './EditProfileForm';
import { useAuthStore } from '../../../entities/user/model/authStore';

afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.setState({ accessToken: null, user: null });
});

const mockUser = {
  id: 'u1',
  email: 'a@example.com',
  name: '기존이름',
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
};

function stubFetch(status = 200, body: unknown = { ...mockUser, name: '변경된이름' }) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<EditProfileForm user={mockUser} />} />
        <Route path="/todos" element={<div>할일 목록 화면</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditProfileForm', () => {
  it('이메일은 읽기 전용으로 프리필되고, 이름은 수정 가능하게 프리필된다', () => {
    stubFetch();
    renderForm();

    expect((screen.getByLabelText('이메일') as HTMLInputElement).value).toBe('a@example.com');
    expect(screen.getByLabelText('이메일')).toHaveAttribute('readonly');
    expect((screen.getByLabelText('이름') as HTMLInputElement).value).toBe('기존이름');
  });

  it('이름도 비밀번호도 변경하지 않고 저장하면 에러를 보여주고 요청을 보내지 않는다', () => {
    const fetchMock = stubFetch();
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('이름을 변경하고 저장하면 PATCH /users/me 가 변경된 name으로 호출된다', async () => {
    const fetchMock = stubFetch();
    renderForm();

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '변경된이름' } });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/users/me');
    expect(JSON.parse(init.body as string)).toEqual({ name: '변경된이름', password: undefined });
  });

  it('새 비밀번호만 입력하고 저장하면 PATCH body에 password만 포함된다', async () => {
    const fetchMock = stubFetch();
    renderForm();

    fireEvent.change(screen.getByLabelText(/새 비밀번호/), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ name: undefined, password: 'newpassword123' });
  });

  it('저장 성공 시 authStore의 user가 갱신되고 /todos로 이동한다', async () => {
    stubFetch();
    renderForm();

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '변경된이름' } });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(await screen.findByText('할일 목록 화면')).toBeInTheDocument();
    expect(useAuthStore.getState().user?.name).toBe('변경된이름');
  });

  it('저장 실패 시 에러 메시지를 보여주고 이동하지 않는다', async () => {
    stubFetch(400, { error: { code: 'VALIDATION_ERROR', message: '이름은 1~100자여야 합니다.' } });
    renderForm();

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '변경된이름' } });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('이름은 1~100자여야 합니다.');
    expect(screen.queryByText('할일 목록 화면')).not.toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 /todos로 이동한다', () => {
    stubFetch();
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.getByText('할일 목록 화면')).toBeInTheDocument();
  });
});
