import { useTranslation } from 'react-i18next'

// Hero лендинга — тёмный тех-моно.
export default function Hero({ onPrimary, onSecondary }) {
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation('common')
  return (
    <section className="relative bg-[#18181C] text-[#EDEDED] overflow-hidden">
      {/* тонкая сетка-фон (без цветных свечений — минимализм) */}
      <div className="absolute inset-0 landing-grid opacity-40 [mask-image:linear-gradient(#000,transparent)]" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <p className="mono-label mb-5">{t('hero.label')}</p>

        <h1 className="font-display font-bold tracking-tight leading-[1.02] text-[clamp(2.6rem,7vw,5rem)]">
          {t('hero.title1')}<br />
          <span className="text-[#6E6E76]">{t('hero.title2')}</span>
        </h1>

        <p className="mt-6 max-w-xl text-[#9A9AA1] text-base sm:text-lg leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* терминал-блок */}
        <div className="mt-8 max-w-lg rounded-xl border border-[#303036] bg-[#1D1D22] font-mono text-[13px] overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 h-8 border-b border-[#303036]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C3C43]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C3C43]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C3C43]" />
            <span className="ml-2 text-[#5A5A60] text-[11px]">{t('hero.term')}</span>
          </div>
          <div className="p-4 space-y-1.5 text-[#8A8A8F]">
            <p><span className="text-brand-400">01</span> {t('hero.term1')}</p>
            <p><span className="text-brand-400">02</span> {t('hero.term2')}</p>
            <p><span className="text-brand-400">03</span> {t('hero.term3')}</p>
            <p className="text-[#EDEDED]"><span className="text-brand-400">04</span> {t('hero.term4')} <span className="caret" /></p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onPrimary}
            className="h-11 px-6 rounded-lg bg-white text-[#18181C] text-sm font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer"
          >
            {t('hero.startFree')}
          </button>
          <button
            onClick={onSecondary}
            className="h-11 px-6 rounded-lg border border-[#3C3C43] text-[#EDEDED] text-sm hover:bg-white/[0.04] hover:border-[#48484F] transition-colors cursor-pointer"
          >
            {tc('login')}
          </button>
        </div>

        {/* живая моно-строка */}
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-[#5A5A60]">
          <span className="text-[#8A8A8F]">{t('hero.stats1')}</span>
          <span>→</span>
          <span className="text-brand-400">{t('hero.stats2')}</span>
          <span className="text-[#3C3C43]">·</span>
          <span>{t('hero.stats3')}</span>
          <span className="text-[#3C3C43]">·</span>
          <span>{t('hero.stats4')}</span>
          <span className="text-[#3C3C43]">·</span>
          <span>{t('hero.stats5')}</span>
        </div>

        {/* макет интерфейса (стилизованный «скрин», без картинки) */}
        <div className="mt-16 rounded-2xl border border-[#303036] bg-[#1D1D22] overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]">
          {/* браузерная рамка */}
          <div className="flex items-center gap-2 px-4 h-9 border-b border-[#303036] bg-[#18181C]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C3C43]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C3C43]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C3C43]" />
            <span className="ml-3 font-mono text-[11px] text-[#5A5A60]">{t('hero.mockTab')}</span>
          </div>
          {/* «светлое» приложение внутри — намёк, что аппа светлая */}
          <div className="bg-[#F7F8FA] p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[[t('hero.kpiDebt'), '2 340 zł', '+2.8%'], [t('hero.kpiToday'), '3', ''], [t('hero.kpiHw'), '5', ''], [t('hero.kpiAttendance'), '92%', '']].map(([k, v, tt]) => (
                <div key={k} className="rounded-xl bg-white border border-[#EAECEF] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="text-[10px] text-[#8A94A6] mb-1">{k}</div>
                  <div className="text-lg font-semibold text-[#0F172A] leading-none">{v}</div>
                  {tt && <div className="text-[10px] text-[#16A34A] mt-1">{tt}</div>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 rounded-xl bg-white border border-[#EAECEF] p-3 h-28 flex items-end gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                {[40, 65, 50, 80, 60, 95, 72].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-brand-500/80" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="rounded-xl bg-white border border-[#EAECEF] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-2">
                <div className="text-[10px] text-[#8A94A6]">{t('hero.upcoming')}</div>
                {['Пн 10:00 · Группа', 'Ср 18:00 · Индивид.'].map(row => (
                  <div key={row} className="text-xs text-[#334155] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />{row}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
