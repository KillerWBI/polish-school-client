import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './sections/Header'
import { SectionShell, IconTile, BrowserFrame, PrimaryButton, GhostButton } from './sections/_kit'
import { IconHomework, IconMoney, IconAttendance, IconClose, IconArrow } from '../../components/ui/icons'

// Отдельный лендинг для УЧЕНИКА (teacher-лендинг — на «/»). Светлый бирюзовый стиль,
// те же примитивы, что у лендинга преподавателя. Шапка — общая: раньше здесь лежала
// её почти дословная копия и правки расходились.
export default function StudentLandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation('common')

  const toRegister = () => navigate('/register-student')
  const toLogin    = () => navigate('/login')

  return (
    <div className="relative overflow-x-hidden bg-white text-[#0E1726] min-h-screen">
      <Header role="student" onLogin={toLogin} onRegister={toRegister} />

      <main>
        {/* ── Hero ── */}
        <section className="relative bg-white overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-40 right-[-10%] w-[720px] h-[720px] rounded-full bg-teal-50 blur-3xl opacity-70 pointer-events-none"
          />
          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-16 sm:pt-40 sm:pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-teal-50 text-teal-700 text-[13px] font-medium px-4 py-2">
                {t('student.heroLabel')}
              </span>

              <h1 className="mt-6 font-display font-bold tracking-tight leading-[1.06] text-[clamp(2.3rem,5.2vw,4.15rem)] text-[#0E1726]">
                {t('student.heroTitle1')}<br />
                <span className="text-teal-500">{t('student.heroTitle2')}</span>
              </h1>

              <p className="mt-6 max-w-lg text-[#5A6B7C] text-base sm:text-lg leading-relaxed">
                {t('student.heroSubtitle')}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PrimaryButton onClick={toRegister}>
                  {t('student.createAccount')}
                  <IconArrow size={18} strokeWidth={2.2} />
                </PrimaryButton>
                <GhostButton onClick={toLogin}>{t('student.haveAccount')}</GhostButton>
              </div>
            </div>

            {/* Телефон-макет кабинета ученика */}
            <div className="relative isolate mx-auto w-[280px]">
              <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
                <div className="blob blob-float absolute -top-10 -right-14 w-64 h-64 bg-teal-200/70" />
                <div className="blob-b absolute bottom-0 -left-16 w-56 h-56 bg-[#EDE9FE]" />
              </div>

              <div className="rounded-[2.4rem] border border-[#E3E9ED] bg-white p-2.5 shadow-[0_30px_70px_-30px_rgba(16,24,40,0.35)]">
                <div className="rounded-[2rem] bg-[#F7FAFB] overflow-hidden">
                  <div className="h-9 flex items-center justify-center bg-white">
                    <span className="w-20 h-1.5 rounded-full bg-[#E2E5EA]" />
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div>
                      <div className="text-[11px] text-[#8FA0AE]">{t('student.phoneHi')}</div>
                      <div className="text-lg font-semibold text-[#0E1726] leading-tight font-display">{t('student.phoneName')}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[[t('student.phoneHw'), '2', 'text-[#D97706]'], [t('student.phoneAtt'), '95%', 'text-[#16A34A]']].map(([k, v, c]) => (
                        <div key={k} className="rounded-xl bg-white border border-[#EAECEF] p-2.5">
                          <div className="text-[9px] text-[#8FA0AE] mb-0.5">{k}</div>
                          <div className={`text-base font-semibold leading-none ${c}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-white border border-[#EAECEF] p-3">
                      <div className="text-[10px] text-[#8FA0AE] mb-2">{t('student.phoneHwBlock')}</div>
                      {[[t('student.phoneHw1'), t('student.phoneHw1d'), true], [t('student.phoneHw2'), t('student.phoneHw2d'), false]].map(([tt, d, warn]) => (
                        <div key={tt} className="flex items-center justify-between py-1 gap-2">
                          <span className="text-[11px] text-[#3D4C5C] flex items-center gap-1.5 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${warn ? 'bg-[#D97706]' : 'bg-[#CBD5E1]'}`} />
                            <span className="truncate">{tt}</span>
                          </span>
                          <span className="text-[10px] text-[#8FA0AE] shrink-0">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-teal-500 text-white p-3">
                      <div className="text-[10px] opacity-85">{t('student.phoneNext')}</div>
                      <div className="text-sm font-semibold mt-0.5">{t('student.phoneLesson')}</div>
                      <div className="mt-2 inline-flex text-[10px] bg-white/25 rounded px-2 py-1">{t('student.phoneGo')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Знакомо? (боль) ── */}
        <section className="bg-[#F7FAFB]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
            <p className="eyebrow mb-3">{t('student.painLabel')}</p>
            <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight mb-10 max-w-2xl leading-[1.15]">
              {t('student.painTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[t('student.pain1'), t('student.pain2'), t('student.pain3'), t('student.pain4')].map(tt => (
                <div key={tt} className="flex items-start gap-3 soft-card p-4">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FEE2E2] text-[#DC2626] inline-flex items-center justify-center shrink-0">
                    <IconClose size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-[#3D4C5C] leading-relaxed">{tt}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-teal-50 border border-teal-100 p-5">
              <span className="w-8 h-8 rounded-lg bg-teal-500 text-white inline-flex items-center justify-center shrink-0">
                <IconArrow size={17} strokeWidth={2.4} />
              </span>
              <span className="text-[15px] text-[#17766F] font-medium leading-relaxed">{t('student.painSolution')}</span>
            </div>
          </div>
        </section>

        {/* ── Возможности: развороты с макетами ── */}
        <SectionShell id="features">
          <p className="eyebrow">{t('student.featLabel')}</p>

          <div className="mt-14 space-y-24">
            <FeatureRow
              icon={IconHomework} tone="mint"
              tag={t('student.f1tag')} title={t('student.f1title')} text={t('student.f1text')}
            >
              <div className="p-4 space-y-2">
                {[[t('student.hwEssay'), t('student.hwEssayD'), t('student.hwSubmit'), null],
                  [t('student.hwWords'), t('student.hwWordsD'), t('student.hwReview'), null],
                  [t('student.hwGram'), t('student.hwGramD'), '92/100', 'grade']].map(([tt, d, s, kind]) => (
                  <div key={tt} className="flex items-center justify-between gap-3 rounded-lg bg-white border border-[#EAECEF] px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#0E1726] truncate">{tt}</div>
                      <div className="text-[11px] text-[#8FA0AE]">{d}</div>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-md font-medium shrink-0 ${
                      kind === 'grade' ? 'bg-teal-50 text-teal-700'
                        : s === t('student.hwSubmit') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>{s}</span>
                  </div>
                ))}
              </div>
            </FeatureRow>

            <FeatureRow
              reverse icon={IconMoney} tone="lilac"
              tag={t('student.f2tag')} title={t('student.f2title')} text={t('student.f2text')}
            >
              <div className="p-4">
                <div className="rounded-xl bg-white border border-[#EAECEF] p-4">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <span className="text-[13px] font-medium text-[#0E1726]">{t('student.debtTeacher')}</span>
                    <span className="text-[11px] text-[#8FA0AE]">{t('student.debtBalance')}</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-600 font-display mb-3">120 zł</div>
                  <div className="h-2 rounded-full bg-[#EEF1F4] overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8FA0AE]">
                    <span>{t('student.debtPaid')}</span><span>{t('student.debtCharged')}</span>
                  </div>
                </div>
              </div>
            </FeatureRow>

            <FeatureRow
              icon={IconAttendance} tone="peach"
              tag={t('student.f3tag')} title={t('student.f3title')} text={t('student.f3text')}
            >
              <div className="p-4 space-y-2">
                {[[t('student.att1'), t('student.att1s'), 'ok'], [t('student.att2'), t('student.att2s'), 'no'], [t('student.att3'), t('student.att3s'), 'wait']].map(([tt, s, k]) => (
                  <div key={tt} className="flex items-center justify-between gap-3 rounded-lg bg-white border border-[#EAECEF] px-3 py-2.5">
                    <span className="text-[13px] text-[#3D4C5C]">{tt}</span>
                    <span className={`text-[11px] px-2 py-1 rounded-md font-medium shrink-0 ${
                      k === 'ok' ? 'bg-emerald-50 text-emerald-700' : k === 'no' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                    }`}>{s}</span>
                  </div>
                ))}
              </div>
            </FeatureRow>
          </div>
        </SectionShell>

        {/* ── Ещё коротко ── */}
        <section className="bg-[#F7FAFB]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                [t('student.short1t'), t('student.short1d')],
                [t('student.short2t'), t('student.short2d')],
                [t('student.short3t'), t('student.short3d')],
                [t('student.short4t'), t('student.short4d')],
              ].map(([tag, text]) => (
                <div key={tag} className="soft-card p-5">
                  <p className="eyebrow mb-2">{tag}</p>
                  <p className="text-[15px] text-[#5A6B7C] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Как начать ── */}
        <SectionShell id="how">
          <div className="max-w-4xl mx-auto">
            <p className="eyebrow mb-3">{t('student.howLabel')}</p>
            <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight mb-12 leading-[1.15]">
              {t('student.howTitle')}
            </h2>
            <div className="space-y-4">
              {[
                [1, t('student.step1t'), t('student.step1d')],
                [2, t('student.step2t'), t('student.step2d')],
                [3, t('student.step3t'), t('student.step3d')],
              ].map(([n, title, text]) => (
                <div key={n} className="flex gap-5 items-start soft-card p-6">
                  <span className="w-9 h-9 rounded-xl bg-teal-500 text-white font-semibold inline-flex items-center justify-center shrink-0">
                    {n}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-[#0E1726] text-lg">{title}</h3>
                    <p className="text-[#5A6B7C] mt-1.5 leading-relaxed max-w-xl">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* ── FAQ ── */}
        <section id="faq" className="bg-[#F7FAFB]">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
            <p className="eyebrow mb-3">{t('student.faqLabel')}</p>
            <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight mb-10">
              {t('student.faqTitle')}
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <FaqItem key={i} q={t(`student.sq${i}`)} a={t(`student.sa${i}`)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Финальный CTA ── */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
            <div className="relative overflow-hidden rounded-3xl bg-teal-500 px-6 sm:px-12 py-16 sm:py-20 text-center">
              <div aria-hidden className="absolute inset-0 pointer-events-none">
                <div className="blob absolute -top-24 -left-16 w-80 h-80 bg-white/10" />
                <div className="blob-b absolute -bottom-28 -right-10 w-96 h-96 bg-white/10" />
              </div>
              <div className="relative">
                <h2 className="font-display font-bold text-white text-3xl sm:text-[2.7rem] tracking-tight leading-[1.12]">
                  {t('student.ctaTitle1')}<br />{t('student.ctaTitle2')}
                </h2>
                <div className="mt-9 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={toRegister}
                    className="inline-flex items-center gap-2 h-13 px-8 rounded-xl bg-white text-teal-700 text-[15px] font-semibold hover:bg-teal-50 transition-colors cursor-pointer shadow-[0_14px_30px_-14px_rgba(0,0,0,0.4)]"
                  >
                    {t('student.createAccount')}
                    <IconArrow size={18} strokeWidth={2.2} />
                  </button>
                  <button
                    onClick={toLogin}
                    className="inline-flex items-center h-13 px-8 rounded-xl border-[1.5px] border-white/60 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {tc('login')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer + кросс-переход ── */}
      <footer className="bg-[#F7FAFB] border-t border-[#EDF1F4]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-[#8FA0AE]">{t('student.footerBrand')}</span>
          <Link to="/" className="text-[14px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            {t('student.footerCross')}
          </Link>
        </div>
      </footer>
    </div>
  )
}

/* Ряд «текст + макет», чередование через reverse */
function FeatureRow({ icon, tone, tag, title, text, children, reverse }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      <div className={reverse ? 'lg:order-2' : ''}>
        <IconTile icon={icon} tone={tone} />
        <p className="eyebrow mt-5 mb-2">{tag}</p>
        <h3 className="font-display font-bold text-[26px] sm:text-[30px] tracking-tight text-[#0E1726] leading-[1.2]">{title}</h3>
        <p className="mt-4 text-[#5A6B7C] leading-relaxed max-w-md">{text}</p>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        <BrowserFrame tone={tone === 'mint' ? 'teal' : tone}>{children}</BrowserFrame>
      </div>
    </div>
  )
}

/* Аккордеон вопроса */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="soft-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 text-left cursor-pointer"
      >
        <span className="text-[15px] font-semibold text-[#0E1726]">{q}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center text-lg leading-none transition-transform ${
          open ? 'rotate-45 bg-teal-500 text-white' : 'bg-[#F1F5F6] text-[#5A6B7C]'
        }`}>+</span>
      </button>
      {open && <p className="px-5 sm:px-6 pb-5 -mt-1 text-[15px] text-[#5A6B7C] leading-relaxed">{a}</p>}
    </div>
  )
}
