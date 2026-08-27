import { describe, it, expect, afterEach, vi } from 'vitest';
import { getInitialTheme, applyTheme } from './theme';

describe('theme', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.unstubAllGlobals();
  });

  it('returns stored theme when present', () => {
    localStorage.setItem('theme', 'dark');
    expect(getInitialTheme()).toBe('dark');
  });

  it('falls back to system preference when nothing stored', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(getInitialTheme()).toBe('dark');
  });

  it('defaults to light when no stored value and system prefers light', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    expect(getInitialTheme()).toBe('light');
  });

  it('applyTheme sets the html data-theme attribute and persists it', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
