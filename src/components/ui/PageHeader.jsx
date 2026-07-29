import { Link } from 'react-router-dom'
import { IconBack } from './icons'

// Шапка страницы кабинета: название, поясняющая строка, кнопки действий.
// Один вид на всех страницах — размеры и отступы задаются здесь, а не в каждой странице.
//   <PageHeader title={t('...')} subtitle={t('...')} actions={<Button>…</Button>} />
//   back={{ to: '/groups', label: 'К группам' }} — ссылка возврата над названием
export default function PageHeader({ title, subtitle, actions, back, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {back && (
        <Link to={back.to}
          className="inline-flex items-center gap-1.5 mb-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <IconBack size={15} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
