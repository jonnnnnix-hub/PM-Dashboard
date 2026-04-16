import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-300 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="btn-danger">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
