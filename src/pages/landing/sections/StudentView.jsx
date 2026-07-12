import { useTranslation } from 'react-i18next'

// «Что видит ученик» — телефон-макет (другой формат визуала).
export default function StudentView() {
  const { t } = useTranslation('landing')
  return (
    <section className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-14 items-center">
        {/* текст */}
        <div>
          <p className="mono-label mb-4">{t('studentView.label')}</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.6rem] leading-[1.1] tracking-tight">
            {t('studentView.title1')} <span className="text-[#6E6E76]">{t('studentView.title2')}</span>
          </h2>
          <p className="mt-5 text-[#9A9AA1] leading-relaxed">
            {t('studentView.text')}
          </p>
          <ul className="mt-6 space-y-3">
            {[
              ['📅', t('studentView.f1t'), t('studentView.f1d')],
              ['✏️', t('studentView.f2t'), t('studentView.f2d')],
              ['✓', t('studentView.f3t'), t('studentView.f3d')],
              ['💰', t('studentView.f4t'), t('studentView.f4d')],
              ['💬', t('studentView.f5t'), t('studentView.f5d')],
            ].map(([e, ti, d]) => (
              <li key={ti} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg border border-[#1E1E22] bg-[#0D0D0F] flex items-center justify-center text-sm shrink-0">{e}</span>
                <div>
                  <div className="text-sm font-medium text-[#EDEDED]">{ti}</div>
                  <div className="text-[13px] text-[#8A8A8F]">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* телефон */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-[270px] rounded-[2.2rem] border border-[#1E1E22] bg-[#0D0D0F] p-2.5 shadow-[0_40px_120px_-40px_rgba(139,92,246,0.3)]">
            <div className="rounded-[1.7rem] overflow-hidden bg-[#F7F8FA]">
              {/* статус-бар */}
              <div className="h-7 bg-white flex items-center justify-center">
                <div className="w-20 h-1.5 rounded-full bg-[#E5E7EB]" />
              </div>
              <div className="p-3 space-y-2.5">
                <div className="text-[11px] text-[#8A94A6]">{t('studentView.hi')} 👋</div>
                {/* KPI */}
                <div className="grid grid-cols-2 gap-2">
                  {[[t('studentView.kUrok'), '2'], [t('studentView.kHw'), '1'], [t('studentView.kAtt'), '92%'], [t('studentView.kDebt'), '200 zł']].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-white border border-[#EAECEF] p-2">
                      <div className="text-[9px] text-[#8A94A6]">{k}</div>
                      <div className="text-sm font-semibold text-[#0F172A]">{v}</div>
                    </div>
                  ))}
                </div>
                {/* урок */}
                <div className="rounded-lg bg-white border border-[#EAECEF] p-2.5">
                  <div className="text-[10px] text-[#8A94A6]">{t('studentView.today')}</div>
                  <div className="text-xs font-medium text-[#0F172A] mt-0.5">{t('studentView.group')}</div>
                  <div className="mt-2 flex gap-1.5">
                    <span className="text-[9px] px-2 py-1 rounded bg-brand-500 text-white">{t('studentView.goLesson')}</span>
                    <span className="text-[9px] px-2 py-1 rounded bg-[#F1F5F9] text-[#475569]">{t('studentView.chat')}</span>
                  </div>
                </div>
                {/* дз */}
                <div className="rounded-lg bg-white border border-[#EAECEF] p-2.5 flex items-center justify-between">
                  <div className="text-[11px] text-[#334155]">{t('studentView.hwItem')}</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309]">{t('studentView.notSubmitted')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
