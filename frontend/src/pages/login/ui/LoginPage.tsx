import { LoginForm } from '../../../features/login/ui/LoginForm';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './LoginPage.css';

export function LoginPage() {
  const { t } = useLocale();
  return (
    <div className="login-page">
      <h1 className="login-page__logo">{t('app.name')}</h1>
      <div className="login-page__card">
        <h2 className="login-page__title">{t('login.title')}</h2>
        <LoginForm />
      </div>
    </div>
  );
}
