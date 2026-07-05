import Modal from './Modal'
import Button from './Button'

// Диалог подтверждения — замена браузерного confirm()
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Удалить', busy = false }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        {message && <p className="text-sm text-slate-500 mb-6">{message}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
