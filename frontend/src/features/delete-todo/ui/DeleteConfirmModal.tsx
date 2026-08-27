import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  todoTitle: string;
  isDeleting?: boolean;
  error?: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  todoTitle,
  isDeleting,
  error,
}: DeleteConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="할일을 삭제하시겠습니까?">
      <p>"{todoTitle}"</p>
      <p>이 작업은 되돌릴 수 없습니다.</p>
      {error && <p role="alert">{error}</p>}
      <div className="delete-confirm-modal__actions">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
          취소
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isDeleting}>
          삭제하기
        </Button>
      </div>
    </Modal>
  );
}
