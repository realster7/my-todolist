import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken } from '../../../shared/api/httpClient';
import type { User } from './types';

// 새로고침 시 로그인 상태 유지 전략: access_token은 메모리(Zustand 상태)에만 보관하고
// localStorage/sessionStorage에 저장하지 않는다.
// - refresh_token은 이미 httpOnly 쿠키로 서버가 관리해 JS에서 접근 불가(XSS 안전).
// - access_token을 localStorage 등에 두면 XSS 발생 시 제3자 스크립트가 탈취 가능해 방어 계층이 사라짐.
// - 새로고침 시 accessToken은 사라지지만 refresh_token 쿠키는 살아있으므로
//   앱 부트스트랩에서 /auth/refresh 1회 호출(AppRouter, src/app/router.tsx)로 복원한다.
// - user(email/name 등 민감하지 않은 프로필)만 localStorage에 유지해, 재발급 완료 전에도
//   헤더가 "로그아웃 상태"로 깜빡이지 않게 한다. accessToken은 절대 persist하지 않는다.

interface AuthState {
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      login: (accessToken, user) => {
        setAccessToken(accessToken);
        set({ accessToken, user });
      },
      logout: () => {
        setAccessToken(null);
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: 'auth-user',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
