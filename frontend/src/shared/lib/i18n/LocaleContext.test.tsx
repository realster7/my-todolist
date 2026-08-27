import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleProvider, useLocale, getInitialLocale } from './LocaleContext';

function Probe() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div>
      <span>{t('login.title')}</span>
      <span>locale:{locale}</span>
      <button type="button" onClick={() => setLocale('en')}>
        switch
      </button>
    </div>
  );
}

describe('LocaleContext', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('defaults to Korean when nothing stored and browser language unsupported', () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' });
    expect(getInitialLocale()).toBe('ko');
  });

  it('uses the stored locale over the browser language', () => {
    localStorage.setItem('locale', 'ja');
    expect(getInitialLocale()).toBe('ja');
  });

  it('provides translations and switches locale, persisting the choice', () => {
    vi.stubGlobal('navigator', { language: 'ko-KR' });
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('locale:ko')).toBeInTheDocument();

    fireEvent.click(screen.getByText('switch'));
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(localStorage.getItem('locale')).toBe('en');
  });

  it('useLocale outside a provider falls back to Korean', () => {
    render(<Probe />);
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });
});
