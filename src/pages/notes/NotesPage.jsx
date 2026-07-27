import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { StickyNote, Plus, Trash2, Pencil } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getNotes, createNote, updateNote, deleteNote } from '../../api/notes.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import PageContainer from '../../components/ui/PageContainer'
import Tooltip from '../../components/ui/Tooltip'

export default function NotesPage() {
  const { t, i18n } = useTranslation('student')
  const { data: notes, loading, reload } = useApiQuery(['notes'], getNotes)
  const [editor, setEditor]     = useState(null)  // null | { note } | { note: null } (создание)
  const [confirmDel, setConfirmDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const doDelete = async () => {
    setBusy(true)
    try { await deleteNote(confirmDel.id); setConfirmDel(null); reload() }
    catch (e) { toast.error(e.response?.data?.error || t('common:error')) }
    finally { setBusy(false) }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t('notes.title')}</h1>
            <p className="text-sm text-slate-500">{t('notes.subtitle')}</p>
          </div>
        </div>
        <Tooltip text={t('notes.tipCreate')} side="left">
          <Button size="sm" onClick={() => setEditor({ note: null })}><Plus className="w-4 h-4 mr-1" /> {t('notes.addBtn')}</Button>
        </Tooltip>
      </div>

      {loading ? (
        <SkeletonList />
      ) : !notes?.length ? (
        <EmptyState emoji="📝" title={t('notes.emptyTitle')} text={t('notes.emptyText')}
          action={<Button size="sm" onClick={() => setEditor({ note: null })}>{t('notes.createBtn')}</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map(n => (
            <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col">
              {n.title && <div className="font-medium text-slate-900 mb-1">{n.title}</div>}
              <div className="text-sm text-slate-600 whitespace-pre-wrap flex-1">{n.text}</div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {new Date(n.updatedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setEditor({ note: n })} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDel(n)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editor && (
        <NoteEditor note={editor.note} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); reload() }} />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        title={t('notes.deleteTitle')}
        message={t('notes.deleteMsg')}
        confirmLabel={t('common:delete')}
        busy={busy}
      />
    </PageContainer>
  )
}

function NoteEditor({ note, onClose, onSaved }) {
  const { t } = useTranslation('student')
  const [title, setTitle] = useState(note?.title || '')
  const [text, setText]   = useState(note?.text || '')
  const [busy, setBusy]   = useState(false)

  const save = async () => {
    if (!text.trim()) { toast.error(t('notes.empty')); return }
    setBusy(true)
    try {
      if (note) await updateNote(note.id, { title: title || null, text })
      else      await createNote({ title: title || null, text })
      toast.success(note ? t('notes.saved') : t('notes.created'))
      onSaved()
    } catch (e) {
      toast.error(e.response?.data?.error || t('common:error'))
    } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">{note ? t('notes.editTitle') : t('notes.newTitle')}</h3>
        <div className="space-y-3">
          <Input label={t('notes.titleLabel')} value={title} onChange={e => setTitle(e.target.value)} placeholder={t('notes.titlePh')} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('notes.textLabel')}</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={6} autoFocus
              placeholder={t('notes.textPh')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>{t('common:cancel')}</Button>
          <Button className="flex-1" onClick={save} loading={busy}>{t('common:save')}</Button>
        </div>
      </div>
    </Modal>
  )
}
