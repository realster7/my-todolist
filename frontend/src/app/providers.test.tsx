import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { Providers } from './providers';

function Probe() {
  const client = useQueryClient();
  return <div>{client ? 'has-client' : 'no-client'}</div>;
}

describe('Providers', () => {
  it('provides a QueryClient to descendants', () => {
    render(
      <Providers>
        <Probe />
      </Providers>,
    );
    expect(screen.getByText('has-client')).toBeInTheDocument();
  });
});
