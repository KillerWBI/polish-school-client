import Modal from './Modal'
import Button from './Button'

// Диалог подтверждения — замена браузерного confirm()
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Удалить', busy = false }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {message && <p className="text-sm text-slate-400 mb-6">{message}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-red-500/80 hover:bg-red-500 border-red-500/30"
            onClick={onConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
