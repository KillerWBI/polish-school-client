import { useTranslation } from 'react-i18next'
import { IconCalendar, IconWrite, IconAttendance, IconMoney, IconChat } from '../../../components/ui/icons'
import { SectionShell, IconTile } from './_kit'

// «Что видит ученик» — телефон-макет (другой формат визуала, чтобы не идти
// подряд четырьмя браузерными рамками).
export default function StudentView() {
  const { t } = useTranslation('landing')

  const rows = [
    [IconCalendar,   'mint',  t('studentView.f1t'), t('studentView.f1d')],
    [IconWrite,      'lilac', t('studentView.f2t'), t('studentView.f2d')],
    [IconAttendance, 'peach', t('studentView.f3t'), t('studentView.f3d')],
    [IconMoney,      'mint',  t('studentView.f4t'), t('studentView.f4d')],
    [IconChat,       'lilac', t('studentView.f5t'), t('studentView.f5d')],
  ]

  return (
    <SectionShell>
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        {/* текст */}
        <div>
          <p className="eyebrow mb-3">{t('studentView.label')}</p>
          <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-[2.6rem] leading-[1.12] tracking-tight">
            {t('studentView.title1')} <span className="text-teal-500">{t('studentView.title2')}</span>
          </h2>
          <p className="mt-5 text-[#5A6B7C] text-base leading-relaxed">{t('studentView.text')}</p>
          <ul className="mt-7 space-y-4">
            {rows.map(([Icon, tone, ti, d]) => (
              <li key={ti} className="flex items-start gap-3.5">
                <IconTile icon={Icon} tone={tone} size="sm" />
                <div>
                  <div className="text-[15px] font-semibold text-[#0E1726]">{ti}</div>
                  <div className="text-[14px] text-[#5A6B7C] leading-relaxed">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* телефон */}
        <div className="relative isolate flex justify-center lg:justify-end">
          <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
            <div className="blob blob-float absolute top-4 right-4 w-64 h-64 bg-teal-100" />
          </div>
          <div className="w-[270px] rounded-[2.2rem] border border-[#E3E9ED] bg-white p-2.5 shadow-[0_30px_70px_-30px_rgba(16,24,40,0.35)]">
            <div className="rounded-[1.7rem] overflow-hidden bg-[#F7FAFB]">
              <div className="h-7 bg-white flex items-center justify-center">
                <div className="w-20 h-1.5 rounded-full bg-[#E5E7EB]" />
              </div>
              <div className="p-3 space-y-2.5">
                <div className="text-[11px] text-[#8FA0AE]">{t('studentView.hi')}</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    [t('studentView.kUrok'), '2'],
                    [t('studentView.kHw'), '1'],
                    [t('studentView.kAtt'), '92%'],
                    [t('studentView.kDebt'), '200 zł'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-white border border-[#EAECEF] p-2">
                      <div className="text-[9px] text-[#8FA0AE]">{k}</div>
                      <div className="text-sm font-semibold text-[#0E1726]">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-white border border-[#EAECEF] p-2.5">
                  <div className="text-[10px] text-[#8FA0AE]">{t('studentView.today')}</div>
                  <div className="text-xs font-medium text-[#0E1726] mt-0.5">{t('studentView.group')}</div>
                  <div className="mt-2 flex gap-1.5">
                    <span className="text-[9px] px-2 py-1 rounded bg-teal-500 text-white">{t('studentView.goLesson')}</span>
                    <span className="text-[9px] px-2 py-1 rounded bg-[#F1F5F9] text-[#475569]">{t('studentView.chat')}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-[#EAECEF] p-2.5 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[#3D4C5C] truncate">{t('studentView.hwItem')}</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] shrink-0">{t('studentView.notSubmitted')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
