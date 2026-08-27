import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByText('클릭')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('reflects disabled attribute on the button', () => {
    render(<Button disabled>클릭</Button>);
    expect(screen.getByText('클릭')).toBeDisabled();
  });
});
