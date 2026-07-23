import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { BookMarked, Plus, Check, X, Trash2, Sparkles, ListPlus, PenLine, Lightbulb } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import { getVocab, getDueVocab, addVocab, bulkAddVocab, generateVocab, reviewVocab, deleteVocab } from '../../api/vocab.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LanguageSelect from '../../components/ui/LanguageSelect'
import { langName } from '../../constants/isoLanguages'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageContainer from '../../components/ui/PageContainer'

const STATUS = {
  new:      { label: 'Новое',   cls: 'bg-slate-100 text-slate-600' },
  learning: { label: 'Учу',     cls: 'bg-amber-100 text-amber-700' },
  known:    { label: 'Знаю',    cls: 'bg-emerald-100 text-emerald-700' },
}

export default function VocabPage() {
  const [tab, setTab] = useState('review')

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Словарь</h1>
          <p className="text-sm text-slate-500">Слова, термины и понятия — карточками с повторением</p>
        </div>
      </div>

      <div className="inline-flex p-0.5 mb-6 rounded-xl bg-slate-100 border border-slate-200">
        <TabBtn active={tab === 'review'} onClick={() => setTab('review')}>Повторить</TabBtn>
        <TabBtn active={tab === 'all'}    onClick={() => setTab('all')}>Все слова</TabBtn>
        <TabBtn active={tab === 'add'}    onClick={() => setTab('add')}>Добавить</TabBtn>
      </div>

      {tab === 'review' && <ReviewTab onEmptyAdd={() => setTab('add')} />}
      {tab === 'all'    && <AllTab />}
      {tab === 'add'    && <AddTab onAdded={() => setTab('all')} />}
    </PageContainer>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`h-8 px-4 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}

/* ── Повторение (флеш-карточки) ── */
function ReviewTab({ onEmptyAdd }) {
  const { data: due, loading, reload } = useFetch(getDueVocab)
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy]       = useState(false)
  const [done, setDone]       = useState(0)

  const answer = async (correct) => {
    const item = due[idx]
    setBusy(true)
    try {
      await reviewVocab(item.id, correct)
      setDone(d => d + 1)
      setFlipped(false)
      if (idx + 1 < due.length) setIdx(idx + 1)
      else { toast.success('Повторение завершено!'); reload(); setIdx(0); setDone(0) }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  if (loading) return <SkeletonList count={1} />
  if (!due?.length) {
    return (
      <EmptyState emoji="🎉" title="На сегодня всё повторено"
        text="Новые слова появятся здесь по расписанию. Добавьте ещё слов для изучения."
        action={<Button size="sm" onClick={onEmptyAdd}>Добавить слово</Button>} />
    )
  }

  const item = due[idx]
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm text-slate-500">
        <span>Осталось: {due.length - idx}</span>
        <span>Пройдено: {done}</span>
      </div>

      <button onClick={() => setFlipped(f => !f)}
        className="w-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center hover:border-slate-300 transition-colors cursor-pointer">
        <div className="text-2xl font-semibold text-slate-900">{item.word}</div>
        {flipped ? (
          <>
            <div className="w-full border-t border-slate-100 my-4" />
            <div className="text-xl text-blue-700">{item.translation}</div>
            {item.example && <div className="text-sm text-slate-400 mt-3 italic">{item.example}</div>}
          </>
        ) : (
          <div className="text-xs text-slate-400 mt-4">Нажмите, чтобы увидеть перевод</div>
        )}
      </button>

      {flipped && (
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => answer(false)} loading={busy}>
            <X className="w-4 h-4 mr-1" /> Не знаю
          </Button>
          <Button className="flex-1" onClick={() => answer(true)} loading={busy}>
            <Check className="w-4 h-4 mr-1" /> Знаю
          </Button>
        </div>
      )}
    </div>
  )
}

/* ── Все слова (с фильтром по языку) ── */
function AllTab() {
  const [langFilter, setLangFilter] = useState('') // '' = все, 'none' = без языка, иначе ISO-код
  // Колбэк пересоздаётся при смене фильтра → useFetch перезагружает список с сервера.
  const { data, loading, reload } = useFetch(
    useCallback(() => getVocab({ limit: 200, ...(langFilter ? { language: langFilter } : {}) }), [langFilter])
  )
  const [confirmDel, setConfirmDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const items     = data?.data ?? []
  const counts    = data?.meta?.counts ?? { new: 0, learning: 0, known: 0 }
  const languages = data?.meta?.languages ?? []          // какие языки есть в словаре (вкл. null)
  const codes     = languages.filter(Boolean)            // без null — реальные коды
  const hasNoLang = languages.includes(null)             // есть ли слова без языка

  const doDelete = async () => {
    setBusy(true)
    try {
      await deleteVocab(confirmDel.id)
      setConfirmDel(null)
      reload()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  if (loading) return <SkeletonList />
  // Пусто только если и фильтра нет, и слов нет
  if (!items.length && !langFilter) {
    return <EmptyState emoji="📖" title="Словарь пуст" text="Добавьте первые слова во вкладке «Добавить»." />
  }

  return (
    <div>
      {/* Фильтр по языку — показываем, если языков в словаре больше одного (или есть «без языка») */}
      {(codes.length > 0) && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-500">Язык:</span>
          <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500">
            <option value="">Все языки</option>
            {codes.map((c) => <option key={c} value={c}>{langName(c)}</option>)}
            {hasNoLang && <option value="none">Без языка</option>}
          </select>
        </div>
      )}

      {/* Прогресс по статусам (в рамках выбранного языка) */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {['new', 'learning', 'known'].map(s => (
          <div key={s} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{counts[s]}</div>
            <div className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${STATUS[s].cls}`}>{STATUS[s].label}</div>
          </div>
        ))}
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
          Слов на этом языке пока нет
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 items-start">
          {items.map(v => (
            <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 truncate">{v.word}</div>
                <div className="text-sm text-slate-500 truncate">{v.translation}</div>
              </div>
              {v.language && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                  {langName(v.language)}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS[v.status].cls}`}>{STATUS[v.status].label}</span>
              <button onClick={() => setConfirmDel(v)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        title="Удалить слово?"
        message={`«${confirmDel?.word}» будет удалено из словаря.`}
        confirmLabel="Удалить"
        busy={busy}
      />
    </div>
  )
}

/* ── Разбор массовой вставки ──
   Каждая непустая строка = одна пара. Разделитель: Tab ИЛИ тире в окружении пробелов
   (« - », « — », « – »). Дефис внутри слова (long-term) НЕ считается разделителем. */
const SEP_RE = /\t|\s[-—–]\s/
function parseBulk(text) {
  return String(text).split(/\r?\n/).map((line) => {
    const s = line.trim()
    if (!s) return null
    const m = s.match(SEP_RE)      // ищем первый разделитель
    if (!m) return null            // нет разделителя — строку пропускаем
    const word = s.slice(0, m.index).trim()
    const translation = s.slice(m.index + m[0].length).trim()
    if (!word || !translation) return null
    return { word, translation }
  }).filter(Boolean)               // выкидываем невалидные строки (null)
}

/* ── Добавить (3 режима: Одно / Списком / AI-генерация) ── */
function AddTab({ onAdded }) {
  const [mode, setMode]     = useState('one')  // one | bulk | ai
  const [lang, setLang]     = useState('')     // язык изучаемых слов
  const [native, setNative] = useState('')     // родной язык (перевод)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Общие для всех режимов языки (фикс. список — без опечаток) */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Язык слов</label>
          <LanguageSelect value={lang} onChange={setLang} placeholder="Что учу" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Мой язык (перевод)</label>
          <LanguageSelect value={native} onChange={setNative} placeholder="Родной язык" />
        </div>
      </div>

      {/* Переключатель режима добавления */}
      <div className="inline-flex p-0.5 mb-5 rounded-xl bg-slate-100 border border-slate-200">
        <ModeBtn active={mode === 'one'}  onClick={() => setMode('one')}><PenLine className="w-4 h-4" /> Одно</ModeBtn>
        <ModeBtn active={mode === 'bulk'} onClick={() => setMode('bulk')}><ListPlus className="w-4 h-4" /> Списком</ModeBtn>
        <ModeBtn active={mode === 'ai'}   onClick={() => setMode('ai')}><Sparkles className="w-4 h-4" /> AI-подбор</ModeBtn>
      </div>

      {mode === 'one'  && <OneForm  lang={lang} native={native} onAdded={onAdded} />}
      {mode === 'bulk' && <BulkForm lang={lang} native={native} onAdded={onAdded} />}
      {mode === 'ai'   && <AiForm   lang={lang} native={native} onAdded={onAdded} />}
    </div>
  )
}

function ModeBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}

/* Режим 1: одно слово */
function OneForm({ lang, native, onAdded }) {
  const [word, setWord]       = useState('')
  const [translation, setTr]  = useState('')
  const [example, setExample] = useState('')
  const [busy, setBusy]       = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!word.trim() || !translation.trim()) { toast.error('Заполните слово и перевод'); return }
    setBusy(true)
    try {
      await addVocab({ word, translation, example: example || null, language: lang || null, nativeLanguage: native || null })
      toast.success('Слово добавлено')
      setWord(''); setTr(''); setExample('')
      onAdded?.()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <Input label="Слово / термин" value={word} onChange={e => setWord(e.target.value)} placeholder="слово, термин или понятие" />
      <Input label="Перевод / определение" value={translation} onChange={e => setTr(e.target.value)} placeholder="перевод или определение" />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Пример (необязательно)</label>
        <textarea value={example} onChange={e => setExample(e.target.value)} rows={2}
          placeholder="пример использования"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none" />
      </div>
      <Button type="submit" loading={busy} className="w-full">
        <Plus className="w-4 h-4 mr-1" /> Добавить в словарь
      </Button>
    </form>
  )
}

/* Режим 2: списком (массовая вставка) */
function BulkForm({ lang, native, onAdded }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const parsed = parseBulk(text)  // живой предпросмотр: сколько пар распознано

  const submit = async () => {
    if (!parsed.length) { toast.error('Не распознано ни одной пары «слово — перевод»'); return }
    setBusy(true)
    try {
      const res = await bulkAddVocab({ items: parsed, language: lang || null, nativeLanguage: native || null })
      const { added, skipped } = res.meta || {}
      toast.success(`Добавлено слов: ${added}${skipped ? ` (не влезло по лимиту: ${skipped})` : ''}`)
      setText('')
      onAdded?.()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка массового добавления')
    } finally { setBusy(false) }
  }

  return (
    <div className="grid md:grid-cols-[1fr_260px] gap-4 items-start">
      {/* Поле ввода */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">Список слов</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
          placeholder={'кот - cat\nсобака - dog\nдом - house\n(или через Tab: слово⭾перевод)'}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-y font-mono" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">Распознано пар: <b className="text-slate-600">{parsed.length}</b></span>
          <Button size="sm" onClick={submit} loading={busy} disabled={!parsed.length}>
            <ListPlus className="w-4 h-4 mr-1" /> Добавить {parsed.length ? `(${parsed.length})` : ''}
          </Button>
        </div>
      </div>

      {/* Инструкция сбоку */}
      <aside className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-500" /> Как заполнять
        </div>
        <ul className="space-y-1.5 text-slate-600 text-[13px] leading-relaxed">
          <li>• Одна пара — <b>с новой строки</b>.</li>
          <li>• Разделитель слова и перевода — <b>тире</b> « - » или <b>Tab</b>.</li>
          <li>• Дефис внутри слова (long-term) не мешает.</li>
        </ul>
        <div className="mt-3 rounded-lg bg-white border border-slate-200 p-2 font-mono text-[12px] text-slate-600 whitespace-pre">кот - cat{'\n'}dom - house{'\n'}gato — cat</div>
      </aside>
    </div>
  )
}

/* Режим 3: AI-подбор набора слов */
const LEVELS = [
  { v: 'beginner',     label: 'Начальный (A1–A2)' },
  { v: 'intermediate', label: 'Средний (B1–B2)' },
  { v: 'advanced',     label: 'Продвинутый (C1–C2)' },
]
function AiForm({ lang, native, onAdded }) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(20)
  const [level, setLevel] = useState('beginner')
  const [busy, setBusy]   = useState(false)

  const submit = async () => {
    if (!lang || !native) { toast.error('Выберите язык слов и родной язык вверху'); return }
    if (!topic.trim())    { toast.error('Укажите тему набора'); return }
    const n = Math.min(100, Math.max(1, Number(count) || 20))
    setBusy(true)
    try {
      const res = await generateVocab({ language: lang, nativeLanguage: native, topic: topic.trim(), count: n, level })
      const { added, skipped } = res.meta || {}
      toast.success(`Сгенерировано и добавлено: ${added}${skipped ? ` (не влезло: ${skipped})` : ''}`)
      setTopic('')
      onAdded?.()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Не удалось сгенерировать')
    } finally { setBusy(false) }
  }

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-4 items-start">
      {/* Форма */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <Input label="Тема набора" value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="напр.: еда в ресторане, для работы официантом, школьная биология" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Сколько слов (1–100)</label>
            <input type="number" min={1} max={100} value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Уровень</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500">
              {LEVELS.map((l) => <option key={l.v} value={l.v}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={submit} loading={busy} className="w-full">
          <Sparkles className="w-4 h-4 mr-1" /> Сгенерировать и добавить
        </Button>
        <p className="text-xs text-slate-400">Слова добавятся в словарь сразу, с примером-предложением на изучаемом языке.</p>
      </div>

      {/* Подсказка по темам сбоку */}
      <aside className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-500" /> Как выбрать тему
        </div>
        <p className="text-[13px] text-slate-600 mb-2">Опишите, для чего вам слова — чем конкретнее, тем точнее набор:</p>
        <ul className="space-y-1.5 text-slate-600 text-[13px] leading-relaxed">
          <li>• <b>Для разговора</b> — «повседневное общение», «знакомство»</li>
          <li>• <b>Для работы</b> — укажите какую: «официант», «программист», «врач»</li>
          <li>• <b>Для школы</b> — предмет: «биология», «математика»</li>
          <li>• <b>Путешествия</b> — «аэропорт», «отель», «кафе»</li>
          <li>• <b>По теме</b> — «еда», «одежда», «эмоции», «погода»</li>
        </ul>
      </aside>
    </div>
  )
}
