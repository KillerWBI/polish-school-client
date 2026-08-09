import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getNotificationHistory, markNotificationRead } from '../../api/notifications.api'
import useApiQuery from '../../hooks/useApiQuery'
import { notifMeta } from '../../components/ui/notifMeta'
import { IconNotifications } from '../../components/ui/icons'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { SkeletonList } from '../../components/ui/Skeleton'

// История событий: колокольчик держит только свежее, всё остальное — здесь.
export default function NotificationsPage() {
  const { t, i18n } = useTranslation('app')
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, loading, reload } = useApiQuery(
    ['notification-history', page],
    (signal) => getNotificationHistory({ page }, signal),
  )

  const items = data?.data || []
  const pages = data?.meta?.pages || 1

  const fmt = (iso) => new Date(iso).toLocaleString(i18n.language, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  const open = async (n) => {
    if (!n.readAt) await markNotificationRead(n.id).catch(() => {})
    if (n.link) navigate(n.link)
    else reload()
  }

  return (
    <PageContainer>
      <PageHeader title={t('notificationsPage.title')} subtitle={t('notificationsPage.subtitle')} />

      {loading ? (
        <SkeletonList count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={IconNotifications}
          title={t('notificationsPage.emptyTitle')}
          text={t('notificationsPage.emptyText')}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {items.map((n) => {
            const meta = notifMeta(n.type)
            return (
              <button key={n.id} onClick={() => open(n)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${n.link ? 'cursor-pointer' : 'cursor-default'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.cls}`}>
                  <meta.Icon size={16} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-800">{n.title}</span>
                  {n.body && <span className="block text-xs text-slate-500 mt-0.5">{n.body}</span>}
                </span>
                <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">{fmt(n.createdAt)}</span>
                {!n.readAt && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
              </button>
            )
          })}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </PageContainer>
  )
}
