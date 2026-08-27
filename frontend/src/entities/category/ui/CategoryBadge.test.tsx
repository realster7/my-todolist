import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from './CategoryBadge';

describe('CategoryBadge', () => {
  it('name prop 텍스트를 렌더링한다', () => {
    render(<CategoryBadge name="업무" />);

    expect(screen.getByText('업무')).toBeInTheDocument();
  });
});
