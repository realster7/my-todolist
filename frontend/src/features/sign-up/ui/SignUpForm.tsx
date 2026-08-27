import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { signUp } from '../api/signUp';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import { isApiError } from '../../../shared/lib/apiError';
import './SignUpForm.css';

export function SignUpForm() {
  const navigate = useNavigate();
  const { t } = useLocale();
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
        setFormError(t('signup.genericError'));
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
        label={t('field.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        required
      />
      <Input
        label={t('field.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      <Input
        label={t('field.name')}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {t('signup.submit')}
      </Button>
      <p className="sign-up-form__login-link">
        {t('signup.haveAccount')} <Link to="/login">{t('signup.loginLink')}</Link>
      </p>
    </form>
  );
}
