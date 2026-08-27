import { LoginForm } from '../../../features/login/ui/LoginForm';
import './LoginPage.css';

export function LoginPage() {
  return (
    <div className="login-page">
      <h1 className="login-page__logo">TodoList</h1>
      <div className="login-page__card">
        <h2 className="login-page__title">로그인</h2>
        <LoginForm />
      </div>
    </div>
  );
}
