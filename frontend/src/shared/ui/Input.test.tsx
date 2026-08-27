import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('connects label and input via getByLabelText', () => {
    render(<Input label="이메일" />);
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<Input label="이메일" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'a@b.com' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows error text and aria-invalid when error is given', () => {
    render(<Input label="이메일" error="이메일 형식이 올바르지 않습니다." />);
    expect(screen.getByText('이메일 형식이 올바르지 않습니다.')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'true');
  });
});
