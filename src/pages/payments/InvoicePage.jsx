import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useApiQuery from '../../hooks/useApiQuery'
import { getInvoice } from '../../api/invoices.api'
import { formatMoney } from '../../utils/money'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import PageContainer from '../../components/ui/PageContainer'

/**
 * Сам документ — печатная страница.
 *
 * Почему не серверный PDF: встроенные шрифты pdfkit — Latin-1, в них нет ни кириллицы,
 * ни польских ą/ć/ę/ł/ż. Пришлось бы класть в репозиторий TTF-шрифт и следить, чтобы он
 * покрывал все 7 языков интерфейса. Печать из браузера («Сохранить как PDF») делает то же
 * самое, любым шрифтом системы и без единой зависимости — а ученику всё равно, чем
 * сгенерирован файл. Если позже понадобится отправлять PDF письмом, тогда и появится
 * причина ставить генератор.
 */
export default function InvoicePage() {
  const { id } = useParams()
  const { t } = useTranslation('teacher')
  const navigate = useNavigate()
  const { data: inv, loading } = useApiQuery(['invoice', id], () => getInvoice(id))

  if (loading) return <PageContainer><SkeletonList rows={4} /></PageContainer>
  if (!inv) return null

  const money = (n) => formatMoney(Number(n), inv.currency)
  // Реквизиты преподавателя — те же, что на странице оплаты: свободные пары «канал — значение»
  const details = Object.entries(inv.teacher?.paymentDetails || {}).filter(([, v]) => v)

  return (
    <PageContainer>
      {/* Панель действий на экране; при печати её быть не должно */}
      <div className="flex gap-2 mb-4 print:hidden">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>{t('invoices.back')}</Button>
        <Button size="sm" onClick={() => window.print()}>{t('invoices.print')}</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 print:border-0 print:rounded-none print:p-0">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            {/* Именно «Счёт на оплату», не «Faktura VAT»: это не налоговый документ */}
            <h1 className="text-2xl font-semibold text-slate-900">{t('invoices.docTitle')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('invoices.number', { n: inv.number })} · {t('invoices.issued', { date: inv.issuedAt })}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>{t('invoices.period', { from: inv.periodFrom, to: inv.periodTo })}</div>
            {inv.dueDate && <div>{t('invoices.due', { date: inv.dueDate })}</div>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">{t('invoices.from')}</div>
            <div className="font-medium text-slate-900">{inv.teacher?.name}</div>
            <div className="text-slate-500">{inv.teacher?.email}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">{t('invoices.toWhom')}</div>
            <div className="font-medium text-slate-900">{inv.student?.name}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="py-2 pr-3 font-medium">{t('invoices.colDate')}</th>
                <th className="py-2 pr-3 font-medium">{t('invoices.colTitle')}</th>
                <th className="py-2 font-medium text-right">{t('invoices.colPrice')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inv.positions.map((p, i) => (
                <tr key={i}>
                  <td className="py-2 pr-3 text-slate-500 tabular-nums whitespace-nowrap">{p.date}</td>
                  <td className="py-2 pr-3 text-slate-800">{p.title}</td>
                  <td className="py-2 text-right tabular-nums text-slate-900">{money(p.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan={2} className="py-3 font-semibold text-slate-900">{t('invoices.total')}</td>
                <td className="py-3 text-right font-semibold text-slate-900 tabular-nums">{money(inv.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {details.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">{t('invoices.payTo')}</div>
            <dl className="space-y-1 text-sm">
              {details.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-slate-500 min-w-24">{k}</dt>
                  <dd className="text-slate-900 break-all">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {inv.note && <p className="mt-6 text-sm text-slate-500">{inv.note}</p>}
      </div>
    </PageContainer>
  )
}
