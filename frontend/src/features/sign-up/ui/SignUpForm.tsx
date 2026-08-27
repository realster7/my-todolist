import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { signUp } from '../api/signUp';
import './SignUpForm.css';

interface ApiError {
  status: number;
  code: string;
  message: string;
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'code' in err && 'message' in err;
}

export function SignUpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(undefined);
    setFormError(undefined);
    setIsSubmitting(true);

    try {
      await signUp({ email, password, name });
      navigate('/login');
    } catch (err) {
      if (isApiError(err) && err.status === 409 && err.code === 'DUPLICATE_EMAIL') {
        setEmailError(err.message);
      } else if (isApiError(err)) {
        setFormError(err.message);
      } else {
        setFormError('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sign-up-form" noValidate>
      {formError && (
        <p className="sign-up-form__error" role="alert">
          {formError}
        </p>
      )}
      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        required
      />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      <Input
        label="이름"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        가입하기
      </Button>
      <p className="sign-up-form__login-link">
        이미 계정이 있으신가요? <Link to="/login">로그인하기</Link>
      </p>
    </form>
  );
}
