import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SignUpPage } from '../pages/sign-up/ui/SignUpPage';
import { LoginPage } from '../pages/login/ui/LoginPage';
import { TodoListPage } from '../pages/todo-list/ui/TodoListPage';
import { TodoFormPage } from '../pages/todo-form/ui/TodoFormPage';
import { useAuthStore } from '../entities/user/model/authStore';
import { setAccessToken } from '../shared/api/httpClient';
import { logDev } from '../shared/lib/logger';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/signup', element: <SignUpPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/todos', element: <ProtectedRoute><TodoListPage /></ProtectedRoute> },
  { path: '/todos/new', element: <ProtectedRoute><TodoFormPage /></ProtectedRoute> },
  { path: '/todos/:id/edit', element: <ProtectedRoute><TodoFormPage /></ProtectedRoute> },
]);

export function AppRouter() {
  // 새로고침 직후: user는 localStorage에서 복원됐지만 accessToken은 메모리라 비어있는 상태.
  // refresh_token 쿠키가 유효하면 access_token을 재발급받아 로그인 상태를 완전히 복원하고,
  // 무효(만료/로그아웃)면 남아있던 user도 지워 헤더가 실제 상태와 어긋나지 않게 한다.
  useEffect(() => {
    const { user, accessToken } = useAuthStore.getState();
    if (!user || accessToken) return;

    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          logDev('[bootstrap] refresh failed, clearing stale session');
          useAuthStore.getState().logout();
          return;
        }
        const { accessToken: newToken } = await res.json();
        setAccessToken(newToken);
        useAuthStore.setState({ accessToken: newToken });
        logDev('[bootstrap] session restored');
      })
      .catch(() => {
        logDev('[bootstrap] refresh request failed');
        useAuthStore.getState().logout();
      });
  }, []);

  return <RouterProvider router={router} />;
}
