import { Link } from 'react-router-dom'
import { ArrowLeft, Scale } from 'lucide-react'

// Общий каркас юридических страниц: шапка с возвратом, читаемый контент, нижние ссылки.
// props: title (заголовок), updated (дата вступления в силу), children (секции).
export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
        <p className="text-xs text-slate-400 mb-8">Дата вступления в силу: {updated}</p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-7 text-sm leading-relaxed text-slate-700">
          {children}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/privacy" className="hover:text-slate-600 transition-colors">Конфиденциальность</Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-slate-600 transition-colors">Условия использования</Link>
          <span className="mx-2">·</span>
          <Link to="/support" className="hover:text-slate-600 transition-colors">Поддержка</Link>
        </div>
      </div>
    </div>
  )
}

// Секция юр-документа: нумерованный заголовок + содержимое.
export function LegalSection({ n, title, children }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-2">{n}. {title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
