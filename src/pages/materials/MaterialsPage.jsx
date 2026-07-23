import { useState, useMemo } from 'react'
import { FolderOpen, Link2, FileText, Type, Search } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getMaterials } from '../../api/materials.api'
import { safeUrl } from '../../utils/safeUrl'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import PageContainer from '../../components/ui/PageContainer'

// Иконка по типу материала: link | file | text
const TYPE_ICON = { link: Link2, file: FileText, text: Type }

export default function MaterialsPage() {
  const { data, loading } = useApiQuery(['materials'], getMaterials)
  const [q, setQ] = useState('')

  const lessons = useMemo(() => {
    const items = data ?? []
    const query = q.trim().toLowerCase()
    if (!query) return items
    return items.filter(l =>
      (l.topic || '').toLowerCase().includes(query) ||
      (l.groupName || '').toLowerCase().includes(query) ||
      (l.materials || []).some(m => (m.title || '').toLowerCase().includes(query))
    )
  }, [data, q])

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Материалы</h1>
          <p className="text-sm text-slate-500">Все файлы и ссылки с уроков в одном месте</p>
        </div>
      </div>

      {loading ? (
        <SkeletonList />
      ) : !data?.length ? (
        <EmptyState emoji="📎" title="Материалов пока нет"
          text="Здесь появятся файлы и ссылки, прикреплённые к урокам." />
      ) : (
        <>
          <div className="relative mb-5 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по теме, группе, названию"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15" />
          </div>

          {!lessons.length ? (
            <EmptyState emoji="🔍" title="Ничего не найдено" text="Попробуйте изменить запрос." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              {lessons.map(l => <LessonMaterials key={`${l.kind}-${l.id}`} lesson={l} />)}
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}

function LessonMaterials({ lesson }) {
  const date = new Date(lesson.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="text-sm font-medium text-slate-900">{lesson.topic || 'Урок без темы'}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {date}{lesson.groupName && ` · ${lesson.groupName}`}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {lesson.materials.map((m, i) => <MaterialRow key={i} m={m} />)}
      </div>
    </div>
  )
}

function MaterialRow({ m }) {
  const Icon = TYPE_ICON[m.type] ?? FileText
  const title = m.title || (m.type === 'text' ? 'Заметка' : m.url || 'Материал')
  const href = (m.type === 'link' || m.type === 'file') ? safeUrl(m.url) : null

  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-slate-800 truncate">{title}</div>
        {m.type === 'text' && m.content && <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.content}</div>}
        {href && <div className="text-xs text-blue-500 truncate">{m.url}</div>}
      </div>
    </div>
  )

  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-slate-50 transition-colors">{inner}</a>
    : inner
}
