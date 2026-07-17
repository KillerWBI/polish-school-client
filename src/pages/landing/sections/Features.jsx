import { useTranslation } from 'react-i18next'

// «Что умеет» — не сетка, а чередующиеся развороты: текст + свой светлый макет.
// Светлые макеты на тёмном фоне подчёркивают: сам продукт — светлый.

function Row({ index, label, title, children, points, mono, reverse }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* текст */}
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-[#5A5A60]">{index}</span>
          <span className="mono-label">{label}</span>
        </div>
        <h3 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-[#EDEDED]">{title}</h3>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex gap-3 text-sm text-[#9A9AA1]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-[2px] bg-brand-500 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {mono && <p className="mt-5 font-mono text-[12px] text-[#5A5A60] border-l-2 border-[#26262B] pl-3">{mono}</p>}
      </div>
      {/* макет */}
      <div className={reverse ? 'lg:order-1' : ''}>{children}</div>
    </div>
  )
}

/* ── маленькие светлые макеты ── */
const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl bg-white border border-[#EAECEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>
)

function GroupsMock() {
  const { t: tr } = useTranslation('landing')
  return (
    <div className="rounded-2xl bg-[#F7F8FA] border border-[#EAECEF] p-4 space-y-2.5">
      {[[tr('features.gr1'), tr('features.gr1s'), '18:00'], [tr('features.gr2'), tr('features.gr2s'), '19:30'], [tr('features.gr3'), tr('features.gr3s'), 'Пн 12:00']].map(([n, s, t], i) => (
        <Card key={i} className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-600 text-sm font-semibold">{n[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0F172A]">{n}</div>
            <div className="text-[11px] text-[#8A94A6]">{s}</div>
          </div>
          <div className="text-[11px] font-mono text-[#64748B]">{t}</div>
        </Card>
      ))}
    </div>
  )
}

function AttendanceMock() {
  const { t: tr } = useTranslation('landing')
  const rows = [['Аня', true], ['Пётр', true], ['Марта', false], ['Иван', true]]
  return (
    <Card className="p-4 bg-[#F7F8FA]">
      <div className="text-xs text-[#8A94A6] mb-3 font-medium">{tr('features.attTitle')}</div>
      <div className="space-y-2">
        {rows.map(([n, ok]) => (
          <div key={n} className="flex items-center justify-between bg-white rounded-lg border border-[#EAECEF] px-3 py-2">
            <span className="text-sm text-[#334155]">{n}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ok ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
              {ok ? tr('features.attWas') : tr('features.attNo')}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-[#8A94A6]">{tr('features.attNote')}</div>
    </Card>
  )
}

function HomeworkMock() {
  const { t: tr } = useTranslation('landing')
  return (
    <Card className="p-4 bg-white max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-[#0F172A]">{tr('features.hwTitle')}</div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600">{tr('features.hwGraded')}</span>
      </div>
      <div className="mt-1 text-[11px] text-[#8A94A6]">{tr('features.hwDue')}</div>
      <div className="mt-3 rounded-lg bg-[#F7F8FA] border border-[#EAECEF] p-3">
        <div className="text-xs text-[#64748B]">{tr('features.hwFile')}</div>
        <div className="mt-2 text-sm font-semibold text-brand-600">🏆 92 / 100</div>
      </div>
    </Card>
  )
}

function FinanceMock() {
  const { t: tr } = useTranslation('landing')
  return (
    <Card className="p-5 bg-white max-w-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">М</div>
        <div>
          <div className="text-sm font-medium text-[#0F172A]">{tr('features.finName')}</div>
          <div className="text-[11px] text-[#8A94A6]">{tr('features.finVisits')}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[[tr('features.finCharged'), '600'], [tr('features.finPaid'), '400'], [tr('features.finBalance'), '200']].map(([k, v], i) => (
          <div key={k} className={`rounded-lg border p-2 ${i === 2 ? 'border-[#FCD34D]/40 bg-[#FEF9C3]/40' : 'border-[#EAECEF] bg-[#F7F8FA]'}`}>
            <div className="text-[10px] text-[#8A94A6]">{k}</div>
            <div className={`text-sm font-semibold ${i === 2 ? 'text-[#B45309]' : 'text-[#0F172A]'}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-[#8A94A6]">{tr('features.finNote')}</div>
    </Card>
  )
}

export default function Features() {
  const { t } = useTranslation('landing')
  return (
    <section id="features" className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="mono-label mb-3">{t('features.label')}</p>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-2xl">
          {t('features.title')}
        </h2>

        <div className="mt-16 space-y-24">
          <Row index="01" label={t('features.r1label')} title={t('features.r1title')}
            points={[t('features.r1p1'), t('features.r1p2'), t('features.r1p3')]}
            mono={t('features.r1mono')}>
            <GroupsMock />
          </Row>

          <Row index="02" label={t('features.r2label')} title={t('features.r2title')} reverse
            points={[t('features.r2p1'), t('features.r2p2'), t('features.r2p3')]}
            mono={t('features.r2mono')}>
            <AttendanceMock />
          </Row>

          <Row index="03" label={t('features.r3label')} title={t('features.r3title')}
            points={[t('features.r3p1'), t('features.r3p2'), t('features.r3p3')]}
            mono={t('features.r3mono')}>
            <HomeworkMock />
          </Row>

          <Row index="04" label={t('features.r4label')} title={t('features.r4title')} reverse
            points={[t('features.r4p1'), t('features.r4p2'), t('features.r4p3')]}
            mono={t('features.r4mono')}>
            <FinanceMock />
          </Row>
        </div>
      </div>
    </section>
  )
}
