import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { login } from '../api/login';
import { useAuthStore } from '../../../entities/user/model/authStore';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import { isApiError } from '../../../shared/lib/apiError';
import './LoginForm.css';

export function LoginForm() {
  const navigate = useNavigate();
  const { t } = useLocale();
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
        setFormError(t('login.genericError'));
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
        label={t('field.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label={t('field.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {t('login.submit')}
      </Button>
      <p className="login-form__sign-up-link">
        {t('login.noAccount')} <Link to="/signup">{t('login.signUpLink')}</Link>
      </p>
    </form>
  );
}
