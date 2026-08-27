import { describe, it, expect, vi, afterEach } from 'vitest';
import { logDev } from './logger';

const originalDev = import.meta.env.DEV;

afterEach(() => {
  (import.meta.env as { DEV: boolean }).DEV = originalDev;
  vi.restoreAllMocks();
});

describe('logDev', () => {
  it('calls console.log with the given args when DEV is true', () => {
    (import.meta.env as { DEV: boolean }).DEV = true;
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logDev('test');

    expect(spy).toHaveBeenCalledWith('test');
  });

  it('does not call console.log when DEV is false', () => {
    (import.meta.env as { DEV: boolean }).DEV = false;
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logDev('test');

    expect(spy).not.toHaveBeenCalled();
  });
});
