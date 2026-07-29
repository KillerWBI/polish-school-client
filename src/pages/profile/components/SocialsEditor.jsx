import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import {
  IconAdd, IconEdit, IconDelete, IconNext,
  IconTelegram, IconWhatsApp, IconLinkedIn,
} from '../../../components/ui/icons'

// Контакты для связи. Тот же приём, что у способов оплаты:
// список добавленного + «+» → модалка с выбором и заполнением.
const FIELDS = [
  { key: 'socialTelegram', icon: IconTelegram, label: 'Telegram', placeholder: 'username',     prefix: '@',
    href: (v) => `https://t.me/${v.replace(/^@/, '')}` },
  { key: 'socialWhatsApp', icon: IconWhatsApp, label: 'WhatsApp', placeholder: '+48123456789', prefix: '',
    href: (v) => `https://wa.me/${v.replace(/[^0-9]/g, '')}` },
  { key: 'socialLinkedIn', icon: IconLinkedIn, label: 'LinkedIn', placeholder: 'username',     prefix: '',
    href: (v) => (v.startsWith('http') ? v : `https://linkedin.com/in/${v}`) },
]

export default function SocialsEditor({ values, onChange, readOnly = false }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [editing, setEditing] = useState(null)
  const [picking, setPicking] = useState(false)
  const [removing, setRemoving] = useState(null)

  const added  = FIELDS.filter(f => values[f.key])
  const notYet = FIELDS.filter(f => !values[f.key])

  if (readOnly) {
    if (added.length === 0) return <span className="text-xs text-slate-600">{t('settings.notSpecified')}</span>
    return (
      <div className="flex flex-wrap gap-2">
        {added.map(f => <SocialChip key={f.key} field={f} value={values[f.key]} />)}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {added.map(f => (
        <div key={f.key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <f.icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900">{f.label}</div>
            <div className="text-xs text-slate-500 truncate">{f.prefix}{values[f.key]}</div>
          </div>
          <button type="button" onClick={() => setEditing(f)} aria-label={tc('edit')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer">
            <IconEdit size={15} />
          </button>
          <button type="button" onClick={() => setRemoving(f)} aria-label={tc('delete')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
            <IconDelete size={15} />
          </button>
        </div>
      ))}

      {notYet.length > 0 && (
        <Button type="button" size="sm" variant="secondary" onClick={() => setPicking(true)}>
          <IconAdd size={15} /> {t('settings.addContact')}
        </Button>
      )}

      <Modal open={picking} onClose={() => setPicking(false)}
        title={t('settings.chooseContact')} subtitle={t('settings.chooseContactHint')}>
        <div className="space-y-2">
          {notYet.map(f => (
            <button key={f.key} type="button" onClick={() => { setPicking(false); setEditing(f) }}
              className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer">
              <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <f.icon size={17} />
              </span>
              <span className="flex-1 text-sm font-medium text-slate-900">{f.label}</span>
              <IconNext size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      </Modal>

      {editing && (
        <ContactModal
          field={editing}
          value={values[editing.key] || ''}
          onClose={() => setEditing(null)}
          onSave={(v) => { onChange({ ...values, [editing.key]: v }); setEditing(null) }}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => { onChange({ ...values, [removing.key]: '' }); setRemoving(null) }}
        title={t('settings.removeContactTitle')}
        message={removing ? t('settings.removeContactMsg', { contact: removing.label }) : ''}
        confirmLabel={tc('delete')}
      />
    </div>
  )
}

function ContactModal({ field, value, onClose, onSave }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [text, setText] = useState(value)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return setError(t('settings.fieldRequired'))
    onSave(text.trim())
  }

  return (
    <Modal open onClose={onClose} title={field.label}>
      <form onSubmit={submit} className="space-y-3">
        <Input
          label={field.label}
          placeholder={field.placeholder}
          value={text}
          error={error}
          onChange={(e) => { setText(e.target.value); setError('') }}
        />
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
          <Button type="submit" className="flex-1">{tc('save')}</Button>
        </div>
      </form>
    </Modal>
  )
}

// Бейджик для режима просмотра — кликабельная ссылка
function SocialChip({ field, value }) {
  return (
    <a
      href={field.href(value)} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <field.icon size={13} className="text-slate-400" />
      <span>{field.prefix}{value}</span>
    </a>
  )
}
