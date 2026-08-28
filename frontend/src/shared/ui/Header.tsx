import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applyTheme, getInitialTheme } from '../lib/theme';
import { useLocale } from '../lib/i18n/LocaleContext';
import { SUPPORTED_LOCALES, type Locale } from '../lib/i18n/translations';
import './Header.css';

export interface HeaderProps {
  userEmail?: string;
  onLogout?: () => void;
}

const LOCALE_LABEL: Record<Locale, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' };

export function Header({ userEmail, onLogout }: HeaderProps) {
  const [theme, setTheme] = useState(getInitialTheme);
  const { locale, setLocale, t } = useLocale();

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  return (
    <header className="app-header">
      <Link to="/todos" className="app-header__logo">
        {t('app.name')}
      </Link>
      <nav className="app-header__nav">
        <select
          className="app-header__locale-select"
          aria-label={t('header.language')}
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABEL[l]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="app-header__theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {userEmail && (
          <>
            <Link to="/profile" className="app-header__link">
              {t('header.myInfo')}
            </Link>
            <button type="button" className="app-header__link app-header__link--button" onClick={onLogout}>
              {t('header.logout')}
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
