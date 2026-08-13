import { useTranslation } from 'react-i18next'
import { IconTrophy, IconGroups, IconAttendance, IconHomework, IconPayments, IconAI, IconArrow } from '../../../components/ui/icons'
import { SectionShell, SectionHead, IconTile, Check, BrowserFrame } from './_kit'

// «Что умеет» — чередующиеся развороты: текст ↔ макет экрана в браузерной рамке.
// Тон рамки меняется от ряда к ряду, чтобы четыре разворота не слились в один.

function Row({ icon, tone, label, title, text, points, cta, onCta, frameLabel, children, reverse }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* текст */}
      <div className={reverse ? 'lg:order-2' : ''}>
        <IconTile icon={icon} tone={tone} />
        <p className="eyebrow mt-5 mb-2">{label}</p>
        <h3 className="font-display font-bold text-[26px] sm:text-[32px] leading-[1.2] tracking-tight text-[#0E1726]">
          {title}
        </h3>
        <p className="mt-4 text-[#5A6B7C] text-base leading-relaxed">{text}</p>
        <ul className="mt-6 space-y-3">
          {points.map(p => <Check key={p}>{p}</Check>)}
        </ul>
        <button
          onClick={onCta}
          className="mt-7 inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-[15px] font-semibold transition-colors cursor-pointer"
        >
          {cta}
          <IconArrow size={16} strokeWidth={2.4} />
        </button>
      </div>

      {/* макет */}
      <div className={reverse ? 'lg:order-1' : ''}>
        <BrowserFrame tone={tone === 'mint' ? 'teal' : tone} label={frameLabel}>
          {children}
        </BrowserFrame>
      </div>
    </div>
  )
}

/* ── макеты экранов ── */
const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl bg-white border border-[#EAECEF] ${className}`}>{children}</div>
)

function GroupsMock() {
  const { t } = useTranslation('landing')
  const rows = [
    [t('features.gr1'), t('features.gr1s'), '18:00'],
    [t('features.gr2'), t('features.gr2s'), '19:30'],
    [t('features.gr3'), t('features.gr3s'), t('features.gr3time')],
  ]
  return (
    <div className="p-4 space-y-2.5">
      {rows.map(([n, s, time]) => (
        <Card key={n} className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-semibold shrink-0">
            {n.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0E1726] truncate">{n}</div>
            <div className="text-[11px] text-[#8FA0AE]">{s}</div>
          </div>
          <div className="text-[11px] text-[#5A6B7C] shrink-0">{time}</div>
        </Card>
      ))}
    </div>
  )
}

function AttendanceMock() {
  const { t } = useTranslation('landing')
  const rows = [
    [t('features.attN1'), true],
    [t('features.attN2'), true],
    [t('features.attN3'), false],
    [t('features.attN4'), true],
  ]
  return (
    <div className="p-4">
      <div className="text-xs text-[#8FA0AE] mb-3 font-medium">{t('features.attTitle')}</div>
      <div className="space-y-2">
        {rows.map(([n, ok]) => (
          <div key={n} className="flex items-center justify-between bg-white rounded-lg border border-[#EAECEF] px-3 py-2">
            <span className="text-sm text-[#3D4C5C]">{n}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ok ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
              {ok ? t('features.attWas') : t('features.attNo')}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-[#8FA0AE]">{t('features.attNote')}</div>
    </div>
  )
}

function HomeworkMock() {
  const { t } = useTranslation('landing')
  return (
    <div className="p-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-medium text-[#0E1726]">{t('features.hwTitle')}</div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 shrink-0">{t('features.hwGraded')}</span>
        </div>
        <div className="mt-1 text-[11px] text-[#8FA0AE]">{t('features.hwDue')}</div>
        <div className="mt-3 rounded-lg bg-[#F7FAFB] border border-[#EAECEF] p-3">
          <div className="text-xs text-[#5A6B7C]">{t('features.hwFile')}</div>
          <div className="mt-2 text-sm font-semibold text-teal-600 flex items-center gap-1.5">
            <IconTrophy size={15} /> 92 / 100
          </div>
        </div>
      </Card>
    </div>
  )
}

function FinanceMock() {
  const { t } = useTranslation('landing')
  const cells = [
    [t('features.finCharged'), '600'],
    [t('features.finPaid'), '400'],
    [t('features.finBalance'), '200'],
  ]
  return (
    <div className="p-4">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {t('features.finName').charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-[#0E1726] truncate">{t('features.finName')}</div>
            <div className="text-[11px] text-[#8FA0AE]">{t('features.finVisits')}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {cells.map(([k, v], i) => (
            <div key={k} className={`rounded-lg border p-2 ${i === 2 ? 'border-[#FCD34D]/50 bg-[#FEF9C3]/50' : 'border-[#EAECEF] bg-[#F7FAFB]'}`}>
              <div className="text-[10px] text-[#8FA0AE]">{k}</div>
              <div className={`text-sm font-semibold ${i === 2 ? 'text-[#B45309]' : 'text-[#0E1726]'}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-[#8FA0AE]">{t('features.finNote')}</div>
      </Card>
    </div>
  )
}

function AiMock() {
  const { t } = useTranslation('landing')
  const rows = [t('features.aiQ1'), t('features.aiQ2'), t('features.aiQ3')]
  return (
    <div className="p-4">
      <Card className="p-4">
        <div className="text-sm font-medium text-[#0E1726] mb-3">{t('features.aiTitle')}</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[[t('features.aiTopicLabel'), t('features.aiTopicValue')], [t('features.aiLevelLabel'), t('features.aiLevelValue')]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-[#EAECEF] bg-[#F7FAFB] px-2.5 py-1.5">
              <div className="text-[10px] text-[#8FA0AE]">{k}</div>
              <div className="text-[12px] text-[#0E1726] truncate">{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {rows.map((q, i) => (
            <div key={q} className="flex items-start gap-2 rounded-lg bg-[#F7FAFB] border border-[#EAECEF] px-2.5 py-2">
              <span className="text-[10px] text-teal-600 font-semibold mt-0.5 shrink-0">{i + 1}</span>
              <span className="text-[12px] text-[#3D4C5C] leading-snug">{q}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-8 rounded-lg bg-teal-500 text-white text-[12px] font-medium flex items-center justify-center">
          {t('features.aiBtn')}
        </div>
      </Card>
    </div>
  )
}

export default function Features({ onCta }) {
  const { t } = useTranslation('landing')

  return (
    <SectionShell id="features">
      <SectionHead label={t('features.label')} title={t('features.title')} subtitle={t('features.subtitle')} />

      <div className="mt-16 sm:mt-20 space-y-24 sm:space-y-28">
        <Row
          icon={IconGroups} tone="mint" label={t('features.r1label')} title={t('features.r1title')}
          text={t('features.r1text')} frameLabel={t('features.r1frame')}
          points={[t('features.r1p1'), t('features.r1p2'), t('features.r1p3')]}
          cta={t('features.r1cta')} onCta={onCta}
        >
          <GroupsMock />
        </Row>

        <Row
          reverse icon={IconAttendance} tone="lilac" label={t('features.r2label')} title={t('features.r2title')}
          text={t('features.r2text')} frameLabel={t('features.r2frame')}
          points={[t('features.r2p1'), t('features.r2p2'), t('features.r2p3')]}
          cta={t('features.r2cta')} onCta={onCta}
        >
          <AttendanceMock />
        </Row>

        <Row
          icon={IconHomework} tone="peach" label={t('features.r3label')} title={t('features.r3title')}
          text={t('features.r3text')} frameLabel={t('features.r3frame')}
          points={[t('features.r3p1'), t('features.r3p2'), t('features.r3p3')]}
          cta={t('features.r3cta')} onCta={onCta}
        >
          <HomeworkMock />
        </Row>

        <Row
          reverse icon={IconPayments} tone="mint" label={t('features.r4label')} title={t('features.r4title')}
          text={t('features.r4text')} frameLabel={t('features.r4frame')}
          points={[t('features.r4p1'), t('features.r4p2'), t('features.r4p3')]}
          cta={t('features.r4cta')} onCta={onCta}
        >
          <FinanceMock />
        </Row>

        <Row
          icon={IconAI} tone="lilac" label={t('features.r5label')} title={t('features.r5title')}
          text={t('features.r5text')} frameLabel={t('features.r5frame')}
          points={[t('features.r5p1'), t('features.r5p2'), t('features.r5p3')]}
          cta={t('features.r5cta')} onCta={onCta}
        >
          <AiMock />
        </Row>
      </div>
    </SectionShell>
  )
}
