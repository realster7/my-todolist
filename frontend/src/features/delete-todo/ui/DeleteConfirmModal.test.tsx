import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  it('open이 false이면 제목 텍스트가 렌더링되지 않는다', () => {
    render(
      <DeleteConfirmModal open={false} onClose={vi.fn()} onConfirm={vi.fn()} todoTitle="테스트 할일" />,
    );
    expect(screen.queryByText('할일을 삭제하시겠습니까?')).not.toBeInTheDocument();
  });

  it('open이 true이면 제목/할일 제목/안내 문구가 모두 렌더링된다', () => {
    render(
      <DeleteConfirmModal open onClose={vi.fn()} onConfirm={vi.fn()} todoTitle="테스트 할일" />,
    );
    expect(screen.getByText('할일을 삭제하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('"테스트 할일"')).toBeInTheDocument();
    expect(screen.getByText('이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
  });

  it('취소 클릭 시 onClose가 호출되고 onConfirm은 호출되지 않는다', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal open onClose={onClose} onConfirm={onConfirm} todoTitle="테스트 할일" />);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('삭제하기 클릭 시 onConfirm이 호출된다', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal open onClose={vi.fn()} onConfirm={onConfirm} todoTitle="테스트 할일" />);

    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('isDeleting이 true이면 취소/삭제하기 버튼이 모두 disabled 된다', () => {
    render(
      <DeleteConfirmModal open onClose={vi.fn()} onConfirm={vi.fn()} todoTitle="테스트 할일" isDeleting />,
    );

    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '삭제하기' })).toBeDisabled();
  });

  it('error prop이 전달되면 해당 텍스트가 role=alert로 렌더링된다', () => {
    render(
      <DeleteConfirmModal
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        todoTitle="테스트 할일"
        error="실패했습니다"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('실패했습니다');
  });
});
