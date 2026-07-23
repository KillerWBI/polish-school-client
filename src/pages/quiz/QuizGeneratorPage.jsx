import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { generateQuiz } from '../../api/ai.api'
import { saveQuiz } from '../../api/quizzes.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import useAuth from '../../hooks/useAuth'
import QuizRunner from './QuizRunner'

export default function QuizGeneratorPage({ embedded }) {
  const navigate = useNavigate()
  const { t } = useTranslation('app')
  const { isTeacher } = useAuth()
  const DIFFICULTY = [
    { v: 'easy', label: t('quiz.diffEasy') },
    { v: 'medium', label: t('quiz.diffMedium') },
    { v: 'hard', label: t('quiz.diffHard') },
  ]
  const TYPES = [
    { v: 'single', label: t('quiz.typeSingle') },
    { v: 'multiple', label: t('quiz.typeMultiple') },
    { v: 'truefalse', label: t('quiz.typeTrueFalse') },
    { v: 'open', label: t('quiz.typeOpen') },
  ]
  const [form, setForm] = useState({ topic: '', count: 5, difficulty: 'medium', type: 'single', language: t('quiz.defaultLanguage') })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [quiz, setQuiz] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.topic.trim().length < 2) { toast.error(t('quiz.specifyTopic')); return }
    setLoading(true)
    setQuiz(null)
    try {
      const data = await generateQuiz({ ...form, count: Number(form.count) })
      setQuiz(data)
    } catch (err) {
      toast.error(err.response?.data?.error || t('quiz.genFail'))
    } finally {
      setLoading(false)
    }
  }

  const meta = () => ({
    topic: quiz.topic, type: quiz.type, difficulty: quiz.difficulty, language: quiz.language, questions: quiz.questions,
  })

  // Учитель: сохраняем сам тест в библиотеку (без прохождения).
  const handleSaveTest = async () => {
    setSaving(true)
    try {
      const saved = await saveQuiz(meta())
      toast.success(t('quiz.testSaved'))
      navigate(`/quizzes/${saved.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || t('quiz.saveFail'))
    } finally {
      setSaving(false)
    }
  }

  // Прохождение (после «Проверить»): сохраняем ответы+результат в «Мои тесты», остаёмся на странице.
  const saveAttempt = async (answers, score, total) => {
    try {
      await saveQuiz({ ...meta(), answers, score, total })
      toast.success(t('quiz.savedToMy'))
    } catch (err) {
      toast.error(err.response?.data?.error || t('quiz.saveResultFail'))
    }
  }

  return (
    <div className={embedded ? 'max-w-3xl' : 'p-5 sm:p-8 max-w-3xl mx-auto'}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Sparkles className="w-6 h-6 text-blue-600" /> {t('quiz.genTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('quiz.genSubtitle')}</p>
        </div>
      )}

      {/* Форма */}
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
        <Input label={t('quiz.fTopic')} placeholder={t('quiz.topicPlaceholder')}
          value={form.topic} onChange={set('topic')} />

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <Input label={t('quiz.fCount')} type="number" min={1} max={20} value={form.count} onChange={set('count')} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('quiz.fLanguage')}</label>
            <input value={form.language} onChange={set('language')}
              className="w-full h-11 px-3.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <Select label={t('quiz.fDifficulty')} value={form.difficulty} onChange={set('difficulty')} options={DIFFICULTY} />
          <Select label={t('quiz.fType')} value={form.type} onChange={set('type')} options={TYPES} />
        </div>

        <Button type="submit" className="mt-5" loading={loading}>
          <Sparkles className="w-4 h-4" /> {t('quiz.generate')}
        </Button>
      </form>

      {loading && <PageSpinner />}

      {/* Результат. Учитель — сохраняет тест в библиотеку; ученик — проходит и сохраняет результат */}
      {quiz && !loading && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-slate-900 min-w-0 truncate">{quiz.topic}</h2>
            {isTeacher && (
              <Button size="sm" onClick={handleSaveTest} loading={saving} className="shrink-0">{t('quiz.saveTest')}</Button>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-3">
            {t('quiz.resultHint')}
            {isTeacher && t('quiz.resultHintTeacher')}
          </p>
          <QuizRunner quiz={quiz} onCheck={saveAttempt} />
        </div>
      )}
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15">
        {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  )
}
