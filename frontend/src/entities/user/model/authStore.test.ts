import { describe, it, expect, afterEach } from 'vitest';
import { useAuthStore } from './authStore';
import { getAccessToken, setAccessToken } from '../../../shared/api/httpClient';

afterEach(() => {
  setAccessToken(null);
  useAuthStore.setState({ accessToken: null, user: null });
});

const dummyUser = {
  id: 'u1',
  email: 'a@example.com',
  name: '테스트',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('authStore', () => {
  it('초기 상태는 accessToken/user 모두 null이다', () => {
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('login 호출 시 accessToken/user가 반영된다', () => {
    useAuthStore.getState().login('token-1', dummyUser);
    expect(useAuthStore.getState().accessToken).toBe('token-1');
    expect(useAuthStore.getState().user).toEqual(dummyUser);
  });

  it('login 호출 시 httpClient에도 access_token이 동기화된다', () => {
    useAuthStore.getState().login('token-2', dummyUser);
    expect(getAccessToken()).toBe('token-2');
  });

  it('logout 호출 시 accessToken/user가 초기화된다', () => {
    useAuthStore.getState().login('token-3', dummyUser);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logout 호출 시 httpClient의 access_token도 null이 된다', () => {
    useAuthStore.getState().login('token-4', dummyUser);
    useAuthStore.getState().logout();
    expect(getAccessToken()).toBeNull();
  });

  it('updateUser 호출 시 user만 갱신되고 accessToken은 유지된다', () => {
    useAuthStore.getState().login('token-5', dummyUser);
    const updated = { ...dummyUser, name: '변경된이름' };
    useAuthStore.getState().updateUser(updated);
    expect(useAuthStore.getState().user).toEqual(updated);
    expect(useAuthStore.getState().accessToken).toBe('token-5');
  });
});
