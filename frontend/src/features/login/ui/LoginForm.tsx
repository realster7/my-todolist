import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { login } from '../api/login';
import { useAuthStore } from '../../../entities/user/model/authStore';
import './LoginForm.css';

interface ApiError {
  status: number;
  code: string;
  message: string;
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'code' in err && 'message' in err;
}

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(undefined);
    setIsSubmitting(true);

    try {
      const { accessToken, user } = await login({ email, password });
      useAuthStore.getState().login(accessToken, user);
      navigate('/todos');
    } catch (err) {
      if (isApiError(err)) {
        setFormError(err.message);
      } else {
        setFormError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
      {formError && (
        <p className="login-form__error" role="alert">
          {formError}
        </p>
      )}
      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        로그인
      </Button>
      <p className="login-form__sign-up-link">
        계정이 없으신가요? <Link to="/signup">회원가입하기</Link>
      </p>
    </form>
  );
}
