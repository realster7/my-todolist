import { SignUpForm } from '../../../features/sign-up/ui/SignUpForm';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './SignUpPage.css';

export function SignUpPage() {
  const { t } = useLocale();
  return (
    <div className="sign-up-page">
      <h1 className="sign-up-page__logo">{t('app.name')}</h1>
      <div className="sign-up-page__card">
        <h2 className="sign-up-page__title">{t('signup.title')}</h2>
        <SignUpForm />
      </div>
    </div>
  );
}
