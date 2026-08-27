import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, SUPPORTED_LOCALES, type Locale, type TranslationKey } from './translations';
import { logDev } from '../logger';

const STORAGE_KEY = 'locale';

export function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if ((SUPPORTED_LOCALES as readonly string[]).includes(stored ?? '')) return stored as Locale;
  const browser = navigator.language.slice(0, 2);
  return (SUPPORTED_LOCALES as readonly string[]).includes(browser) ? (browser as Locale) : 'ko';
}

type TranslateVars = Record<string, string | number>;
type Translate = (key: TranslationKey, vars?: TranslateVars) => string;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

// 기본값은 항상 'ko' — Provider 없이 단위 렌더링하는 기존 컴포넌트 테스트들이
// 이 폴백으로 동작하므로(브라우저 언어/localStorage에 따라 흔들리지 않도록 고정값 사용).
const defaultContext: LocaleContextValue = {
  locale: 'ko',
  setLocale: () => {},
  t: (key, vars) => interpolate(translations.ko[key], vars),
};

const LocaleContext = createContext<LocaleContextValue>(defaultContext);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  function setLocale(next: Locale) {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
    logDev('[locale]', next);
  }

  function t(key: TranslationKey, vars?: TranslateVars): string {
    return interpolate(translations[locale][key], vars);
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
