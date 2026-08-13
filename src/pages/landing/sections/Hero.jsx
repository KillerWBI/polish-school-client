import { useTranslation } from 'react-i18next'
import { IconArrow, IconCheck, IconStudents } from '../../../components/ui/icons'
import { PrimaryButton, GhostButton, BrowserFrame, Check } from './_kit'

// Геро лендинга: слева обещание обеим сторонам, справа — сам продукт
// на органической подложке. Мокап собран из DOM, а не картинкой: переводится
// вместе с интерфейсом и не устаревает при следующем редизайне кабинета.

/* Мокап дашборда: плитки KPI + столбцы + ближайшие занятия */
function DashboardMock() {
  const { t } = useTranslation('landing')
  const kpi = [
    [t('hero.kpiDebt'), '2 340 zł', '+2.8%'],
    [t('hero.kpiToday'), '3', ''],
    [t('hero.kpiHw'), '5', ''],
    [t('hero.kpiAttendance'), '92%', ''],
  ]
  return (
    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {kpi.map(([k, v, delta]) => (
          <div key={k} className="rounded-xl bg-white border border-[#EAECEF] p-3">
            <div className="text-[10px] text-[#8FA0AE] mb-1 truncate">{k}</div>
            <div className="text-[17px] font-semibold text-[#0E1726] leading-none font-display">{v}</div>
            {delta && <div className="text-[10px] text-teal-600 mt-1">{delta}</div>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2 rounded-xl bg-white border border-[#EAECEF] p-3 h-28 flex items-end gap-1.5">
          {[40, 65, 50, 80, 60, 95, 72].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${i === 5 ? 'bg-teal-500' : 'bg-teal-200'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="rounded-xl bg-white border border-[#EAECEF] p-3 space-y-2">
          <div className="text-[10px] text-[#8FA0AE]">{t('hero.upcoming')}</div>
          {[t('hero.up1'), t('hero.up2')].map(row => (
            <div key={row} className="text-[11px] text-[#3D4C5C] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
              <span className="truncate">{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Hero({ onPrimary, onStudent }) {
  const { t } = useTranslation('landing')

  return (
    <section className="relative bg-white overflow-hidden">
      {/* мягкая бирюзовая подсветка сверху-справа */}
      <div
        aria-hidden
        className="absolute -top-40 right-[-10%] w-[720px] h-[720px] rounded-full bg-teal-50 blur-3xl opacity-70 pointer-events-none"
      />

      {/* pt поменьше на телефоне: там до кнопки идут бейдж, заголовок и три довода —
          с прежним отступом кнопка уходила под сгиб. */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
          {/* ── левая колонка ── */}
          <div>
            <span className="inline-flex items-center rounded-full bg-teal-50 text-teal-700 text-[13px] font-medium px-4 py-2">
              {t('hero.badge')}
            </span>

            {/* Кегль подобран так, чтобы заголовок укладывался в три строки и
                кнопка оставалась над сгибом на ноутбуке. */}
            <h1 className="mt-6 font-display font-bold tracking-tight leading-[1.08] text-[clamp(2.1rem,4.3vw,3.5rem)] text-[#0E1726]">
              {t('hero.title1')}<br />
              <span className="text-teal-500">{t('hero.title2')}</span>
            </h1>

            <p className="mt-6 max-w-xl text-[#5A6B7C] text-base sm:text-lg leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Четыре зоны контроля до первой прокрутки. В две колонки, а не
                столбиком: так они не удлиняют геро и читаются как охват. */}
            <ul className="mt-7 max-w-xl grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {[t('hero.b1'), t('hero.b2'), t('hero.b3'), t('hero.b4')].map(b => <Check key={b}>{b}</Check>)}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryButton onClick={onPrimary}>
                {t('hero.startFree')}
                <IconArrow size={18} strokeWidth={2.2} />
              </PrimaryButton>
              <GhostButton onClick={onStudent}>{t('hero.ctaStudent')}</GhostButton>
            </div>

            <p className="mt-5 text-[13px] text-[#8FA0AE]">{t('hero.socialProof')}</p>
          </div>

          {/* ── правая колонка: блобы + мокап + плавающие карточки ── */}
          {/* isolate — иначе -z-10 попадает в корневой контекст наложения
              и пятна прячутся под белым фоном секции */}
          <div className="relative isolate">
            <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
              <div className="blob blob-float absolute -top-16 -right-10 w-72 h-72 bg-teal-200/70" />
              <div className="blob-b blob-float absolute top-24 -left-16 w-64 h-64 bg-teal-100" style={{ animationDelay: '-3s' }} />
              <div className="blob absolute -bottom-12 right-8 w-44 h-44 bg-[#EDE9FE]" />
            </div>

            <BrowserFrame tone="teal" label={t('hero.mockTab')} className="lg:rotate-[0.6deg]">
              <DashboardMock />
            </BrowserFrame>

            {/* плавающая карточка «журнал заполнен» — на узких экранах мешает, прячем */}
            <div className="hidden sm:flex card-float soft-card absolute -top-7 -right-4 lg:-right-10 items-center gap-2.5 px-3.5 py-2.5 max-w-[230px]">
              <span className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] inline-flex items-center justify-center shrink-0">
                <IconCheck size={15} strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#8FA0AE] leading-tight truncate">{t('hero.floatCard1Label')}</div>
                <div className="text-[13px] font-semibold text-[#0E1726] leading-tight truncate">{t('hero.floatCard1')}</div>
              </div>
            </div>

            {/* плавающая карточка «кабинет ученика» */}
            <div className="hidden sm:flex card-float-slow soft-card absolute -bottom-8 -left-4 lg:-left-12 items-center gap-2.5 px-3.5 py-2.5 max-w-[240px]">
              <span className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#7C3AED] inline-flex items-center justify-center shrink-0">
                <IconStudents size={15} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#8FA0AE] leading-tight truncate">{t('hero.floatCard2Label')}</div>
                <div className="text-[13px] font-semibold text-[#0E1726] leading-tight truncate">{t('hero.floatCard2')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
