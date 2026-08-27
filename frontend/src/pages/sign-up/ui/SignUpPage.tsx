import { SignUpForm } from '../../../features/sign-up/ui/SignUpForm';
import './SignUpPage.css';

export function SignUpPage() {
  return (
    <div className="sign-up-page">
      <h1 className="sign-up-page__logo">TodoList</h1>
      <div className="sign-up-page__card">
        <h2 className="sign-up-page__title">회원가입</h2>
        <SignUpForm />
      </div>
    </div>
  );
}
