import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LifeBuoy, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { submitSupportTicket } from '../../api/support.api'
import useAuth from '../../hooks/useAuth'

const CATEGORIES = [
  ['question', 'Вопрос'],
  ['problem',  'Проблема'],
  ['billing',  'Оплата / тариф'],
  ['idea',     'Идея / предложение'],
]

// Публичная страница обращения в поддержку (доступна и гостю, и залогиненному).
export default function SupportPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name:     user?.name || '',
    email:    user?.email || '',
    subject:  '',
    category: 'question',
    message:  '',
    reason:   '', // только для идеи: зачем это нужно / что улучшит
  })
  const isIdea = form.category === 'idea'
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error('Заполните все поля')
      return
    }
    if (isIdea && !form.reason.trim()) {
      toast.error('Напишите, зачем это нужно и что улучшит')
      return
    }
    setBusy(true)
    try {
      // Идею шлём как обычное обращение (бэкенд-категория идеи пока нет): причину и суть
      // вкладываем в сообщение, а в теме помечаем «💡 Идея», чтобы её было видно в поддержке.
      const message = isIdea
        ? `${form.message.trim()}\n\nЗачем это нужно и что улучшит:\n${form.reason.trim()}`
        : form.message
      const subject  = isIdea ? `💡 Идея: ${form.subject}` : form.subject
      const category = isIdea ? 'question' : form.category
      await submitSupportTicket({ name: form.name, email: form.email, subject, category, message })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Не удалось отправить обращение')
    } finally {
      setBusy(false)
    }
  }

  const inputCls = 'w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow'

  // Залогиненного возвращаем в кабинет, гостя — на лендинг
  const backTo = user ? '/dashboard' : '/'
  const backLabel = user ? 'В кабинет' : 'На главную'

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col">
      <div className="max-w-lg w-full mx-auto px-4 py-10 flex-1">
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Поддержка</h1>
            <p className="text-sm text-slate-500">Опишите вопрос — ответим на email</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Обращение отправлено</h2>
            <p className="text-sm text-slate-500 mb-5">Мы ответим на <b>{form.email}</b> в ближайшее время.</p>
            <Link to={backTo} className="inline-flex h-10 items-center px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Готово
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Имя</label>
                <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Ваше имя" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="you@mail.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Тип обращения</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setForm(f => ({ ...f, category: key }))}
                    className={`h-10 px-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.category === key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Тема</label>
              <input className={inputCls} value={form.subject} onChange={set('subject')}
                placeholder={isIdea ? 'Коротко о вашей идее' : 'Коротко о проблеме'} />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {isIdea ? 'Опишите идею' : 'Сообщение'}
              </label>
              <textarea rows={isIdea ? 4 : 5} value={form.message} onChange={set('message')}
                placeholder={isIdea ? 'Что вы предлагаете добавить или изменить…' : 'Опишите подробно…'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow resize-none" />
            </div>

            {isIdea && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Зачем это нужно и что улучшит</label>
                <textarea rows={3} value={form.reason} onChange={set('reason')}
                  placeholder="Например: сэкономит время на проверке, поможет ученикам не забывать про задания…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow resize-none" />
                <p className="mt-1 text-[11px] text-slate-400">Пара слов о причине помогает нам понять, кому и чем идея полезна.</p>
              </div>
            )}

            <button type="submit" disabled={busy}
              className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Отправить обращение
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
