import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/authStore';

// 3-user-scenario.md 4.5: 인증 없이 할일 관련 화면 접근 시 로그인 화면으로 리다이렉트.
// user와 accessToken이 둘 다 없으면(부트스트랩 재발급도 실패한 상태 포함) 미인증으로 간주한다.
// user만 있고 accessToken이 아직 없는 경우는 AppRouter의 부트스트랩 재발급이 진행 중일 수
// 있으므로 리다이렉트하지 않고 기다린다.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuthStore();

  if (!user && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
