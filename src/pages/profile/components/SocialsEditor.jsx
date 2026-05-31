// 3 поля соцсетей с иконками. readOnly показывает только заполненные.
const FIELDS = [
  { key: 'socialTelegram', icon: '📨', label: 'Telegram',  placeholder: 'username',     prefix: '@' },
  { key: 'socialWhatsApp', icon: '💬', label: 'WhatsApp',  placeholder: '+48123456789', prefix: '' },
  { key: 'socialLinkedIn', icon: '💼', label: 'LinkedIn',  placeholder: 'username',     prefix: '' },
]

export default function SocialsEditor({ values, onChange, readOnly = false }) {
  if (readOnly) {
    const filled = FIELDS.filter(f => values[f.key])
    if (filled.length === 0) return <span className="text-xs text-slate-600">Не указаны</span>
    return (
      <div className="flex flex-wrap gap-2">
        {filled.map(f => (
          <SocialChip key={f.key} field={f} value={values[f.key]} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {FIELDS.map(f => (
        <div key={f.key} className="flex items-center gap-2">
          <span className="w-8 text-center text-base">{f.icon}</span>
          <span className="w-20 text-xs text-slate-400">{f.label}</span>
          {f.prefix && <span className="text-slate-500 text-sm">{f.prefix}</span>}
          <input
            type="text"
            value={values[f.key] || ''}
            onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50"
          />
        </div>
      ))}
    </div>
  )
}

// Бэйджик для read-only режима — кликабельная ссылка
function SocialChip({ field, value }) {
  let href = '#'
  if (field.key === 'socialTelegram')  href = `https://t.me/${value.replace(/^@/, '')}`
  if (field.key === 'socialWhatsApp')  href = `https://wa.me/${value.replace(/[^0-9]/g, '')}`
  if (field.key === 'socialLinkedIn')  href = value.startsWith('http') ? value : `https://linkedin.com/in/${value}`

  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.10] text-xs text-slate-200 hover:bg-white/[0.10] transition-colors"
    >
      <span>{field.icon}</span>
      <span>{field.prefix}{value}</span>
    </a>
  )
}
