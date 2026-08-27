import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
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
  const { t } = useLocale();
  return (
    <Modal open={open} onClose={onClose} title={t('deleteModal.title')}>
      <p>"{todoTitle}"</p>
      <p>{t('deleteModal.warning')}</p>
      {error && <p role="alert">{error}</p>}
      <div className="delete-confirm-modal__actions">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
          {t('deleteModal.cancel')}
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isDeleting}>
          {t('deleteModal.confirm')}
        </Button>
      </div>
    </Modal>
  );
}
