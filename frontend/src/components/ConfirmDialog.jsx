import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink-soft mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 glass-input rounded-lg py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-coral text-void font-semibold rounded-lg py-2.5 text-sm hover:brightness-110 transition-all"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
