import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('does not render title when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="제목">
        내용
      </Modal>,
    );
    expect(screen.queryByText('제목')).not.toBeInTheDocument();
  });

  it('renders a dialog element when open is true', () => {
    render(
      <Modal open onClose={vi.fn()} title="제목">
        내용
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="제목">
        내용
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop (outside the dialog) is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="제목">
        내용
      </Modal>,
    );
    // backdrop == 다이얼로그의 부모 요소 (modal-backdrop). data-testid가 없어 부모 요소를 클릭한다.
    const backdrop = screen.getByRole('dialog').parentElement;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the dialog content', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="제목">
        내용
      </Modal>,
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
