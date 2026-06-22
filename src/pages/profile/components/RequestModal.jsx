import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import useAuth from '../../../hooks/useAuth'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { createLessonRequest } from '../../../api/lessonRequests.api'
import { CEFR_LEVELS, getLanguageName } from '../../../constants/languages'

// Способы связи + откуда брать значение из профиля студента (автоподстановка)
const CONTACT_METHODS = [
  { id: 'telegram',  label: 'Telegram',  field: 'socialTelegram' },
  { id: 'whatsapp',  label: 'WhatsApp',  field: 'socialWhatsApp' },
  { id: 'instagram', label: 'Instagram', field: 'socialInstagram' },
  { id: 'phone',     label: 'Телефон',   field: 'phone' },
]

// Модалка заявки на обучение. teacher = объект профиля учителя (id, languages).
// onSent() вызывается после успешной отправки (родитель обновляет статус заявки).
export default function RequestModal({ open, onClose, teacher, onSent }) {
  const { user } = useAuth()

  // Языки на выбор — те, что преподаёт учитель; если пусто — общий список через native
  const langOptions = useMemo(
    () => (teacher?.languages?.length ? teacher.languages.map(l => l.code) : ['pl', 'en']),
    [teacher]
  )

  const [language, setLanguage]   = useState(langOptions[0])
  const [level, setLevel]         = useState('')
  const [message, setMessage]     = useState('')
  const [method, setMethod]       = useState('telegram')
  // Контакт автозаполняется из профиля; если там пусто — студент вводит вручную
  const [contact, setContact]     = useState(user?.socialTelegram || '')
  const [saving, setSaving]       = useState(false)

  // При смене способа связи — подставляем значение из профиля (если есть)
  const handleMethod = (id) => {
    setMethod(id)
    const field = CONTACT_METHODS.find(m => m.id === id)?.field
    setContact(user?.[field] || '')
  }

  const submit = async () => {
    if (!language)        return toast.error('Выберите язык')
    if (!contact.trim())  return toast.error('Укажите контакт для связи')
    setSaving(true)
    try {
      await createLessonRequest({
        teacherId: teacher.id,
        language,
        level: level || undefined,
        message: message.trim() || undefined,
        contactMethod: method,
        contactValue: contact.trim(),
      })
      toast.success('Заявка отправлена')
      onSent?.()
      onClose?.()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Не удалось отправить заявку')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Записаться на занятия</h2>
          <p className="text-xs text-slate-400 mt-0.5">К преподавателю {teacher?.name}</p>
        </div>

        {/* Язык */}
        <Field label="Язык">
          <select value={language} onChange={e => setLanguage(e.target.value)} className={selectCls}>
            {langOptions.map(code => (
              <option key={code} value={code} className="bg-[#141D35]">{getLanguageName(code)}</option>
            ))}
          </select>
        </Field>

        {/* Уровень (опционально) */}
        <Field label="Ваш уровень (необязательно)">
          <select value={level} onChange={e => setLevel(e.target.value)} className={selectCls}>
            <option value="" className="bg-[#141D35]">Не указывать</option>
            {CEFR_LEVELS.map(lv => (
              <option key={lv} value={lv} className="bg-[#141D35]">{lv}</option>
            ))}
          </select>
        </Field>

        {/* Способ связи */}
        <Field label="Способ связи">
          <div className="grid grid-cols-4 gap-1.5">
            {CONTACT_METHODS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMethod(m.id)}
                className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  method === m.id
                    ? 'bg-brand-600/[0.18] text-white border border-brand-400/50'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <input
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="@username или номер"
            className={`${selectCls} mt-2`}
          />
        </Field>

        {/* Сообщение */}
        <Field label="Сообщение (необязательно)">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 1000))}
            rows={3}
            placeholder="Коротко о целях, расписании, пожеланиях..."
            className={`${selectCls} resize-none`}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1">Отмена</Button>
          <Button onClick={submit} loading={saving} className="flex-1">Отправить</Button>
        </div>
      </div>
    </Modal>
  )
}

const selectCls =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
