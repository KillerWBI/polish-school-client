import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import RoleSwitch from './sections/RoleSwitch'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'

// Отдельный лендинг для УЧЕНИКА (teacher-лендинг — на «/»). Тёмный тех-моно стиль бренда.
export default function StudentLandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation('common')
  const { isAuthenticated, user } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toRegister = () => navigate('/register-student')
  const toLogin    = () => navigate('/login')
  const scrollTo   = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="relative overflow-x-hidden bg-[#0A0A0B] text-[#EDEDED] min-h-screen">
      {/* ── Header ── */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-[#0A0A0B]/85 backdrop-blur-md border-b border-[#1E1E22]' : 'border-b border-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer group">
            <span className="w-2 h-2 rounded-[2px] bg-brand-500 group-hover:bg-brand-400 transition-colors" />
            <span className="font-mono text-sm font-semibold tracking-tight">LinguaFlow</span>
            <span className="font-mono text-[11px] text-[#5A5A60]">{t('student.brandTag')}</span>
          </button>

          <nav className="hidden md:flex items-center gap-8 font-mono text-[13px] text-[#8A8A8F]">
            <button onClick={() => scrollTo('features')} className="hover:text-[#EDEDED] transition-colors cursor-pointer">{t('student.navFeatures')}</button>
            <button onClick={() => scrollTo('how')}      className="hover:text-[#EDEDED] transition-colors cursor-pointer">{t('student.navHow')}</button>
            <button onClick={() => scrollTo('faq')}      className="hover:text-[#EDEDED] transition-colors cursor-pointer">{t('student.navFaq')}</button>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher variant="dark" />
            <RoleSwitch active="student" />
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')}
                className="h-9 px-4 rounded-lg bg-white text-[#0A0A0B] text-[13px] font-medium hover:bg-[#EDEDED] transition-colors cursor-pointer">
                {user?.name ? t('header.toDashboardName', { name: user.name.split(' ')[0] }) : t('header.toDashboard')}
              </button>
            ) : (
              <>
                <button onClick={toLogin}
                  className="hidden sm:inline-flex h-9 px-3 items-center rounded-lg text-[13px] text-[#B4B4BA] hover:text-white transition-colors cursor-pointer">
                  {tc('login')}
                </button>
                <button onClick={toRegister}
                  className="h-9 px-4 rounded-lg bg-white text-[#0A0A0B] text-[13px] font-medium hover:bg-[#EDEDED] transition-colors cursor-pointer">
                  {tc('register')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 landing-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-brand-600/15 blur-[120px] pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20 sm:pt-40 sm:pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <p className="mono-label mb-5">{t('student.heroLabel')}</p>
              <h1 className="font-display font-bold tracking-tight leading-[1.03] text-[clamp(2.4rem,6vw,4.4rem)]">
                {t('student.heroTitle1')}<br /><span className="text-[#6E6E76]">{t('student.heroTitle2')}</span>
              </h1>
              <p className="mt-6 max-w-lg text-[#9A9AA1] text-base sm:text-lg leading-relaxed">
                {t('student.heroSubtitle')}
              </p>

              <div className="mt-8 max-w-md rounded-xl border border-[#1E1E22] bg-[#0D0D0F] font-mono text-[13px] overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 h-8 border-b border-[#1E1E22]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2E]" />
                  <span className="ml-2 text-[#5A5A60] text-[11px]">{t('student.term')}</span>
                </div>
                <div className="p-4 space-y-1.5 text-[#8A8A8F]">
                  <p><span className="text-brand-400">01</span> {t('student.term1')}</p>
                  <p><span className="text-brand-400">02</span> {t('student.term2')}</p>
                  <p><span className="text-brand-400">03</span> {t('student.term3')}</p>
                  <p className="text-[#EDEDED]"><span className="text-brand-400">04</span> {t('student.term4')} <span className="caret" /></p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={toRegister}
                  className="h-11 px-6 rounded-lg bg-white text-[#0A0A0B] text-sm font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer">
                  {t('student.createAccount')}
                </button>
                <button onClick={toLogin}
                  className="h-11 px-6 rounded-lg border border-[#2A2A2E] text-[#EDEDED] text-sm hover:bg-white/[0.04] hover:border-[#3A3A40] transition-colors cursor-pointer">
                  {t('student.haveAccount')}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-[#5A5A60]">
                <span className="text-[#8A8A8F]">{t('student.stat1')}</span>
                <span>→</span>
                <span className="text-brand-400">{t('student.stat2')}</span>
                <span className="text-[#2A2A2E]">·</span>
                <span>{t('student.stat3')}</span>
                <span className="text-[#2A2A2E]">·</span>
                <span>{t('student.stat4')}</span>
              </div>
            </div>

            {/* Телефон-макет кабинета ученика */}
            <div className="relative mx-auto w-[280px]">
              <div className="rounded-[2.4rem] border border-[#1E1E22] bg-[#0D0D0F] p-2.5 shadow-[0_40px_120px_-40px_rgba(139,92,246,0.35)]">
                <div className="rounded-[2rem] bg-[#F7F8FA] overflow-hidden">
                  <div className="h-9 flex items-center justify-center">
                    <span className="w-20 h-1.5 rounded-full bg-[#E2E5EA]" />
                  </div>
                  <div className="px-4 pb-5 space-y-3">
                    <div>
                      <div className="text-[11px] text-[#8A94A6]">{t('student.phoneHi')}</div>
                      <div className="text-lg font-semibold text-[#0F172A] leading-tight">{t('student.phoneName')}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[[t('student.phoneHw'), '2', 'text-[#D97706]'], [t('student.phoneAtt'), '95%', 'text-[#16A34A]']].map(([k, v, c]) => (
                        <div key={k} className="rounded-xl bg-white border border-[#EAECEF] p-2.5">
                          <div className="text-[9px] text-[#8A94A6] mb-0.5">{k}</div>
                          <div className={`text-base font-semibold leading-none ${c}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-white border border-[#EAECEF] p-3">
                      <div className="text-[10px] text-[#8A94A6] mb-2">{t('student.phoneHwBlock')}</div>
                      {[[t('student.phoneHw1'), t('student.phoneHw1d'), true], [t('student.phoneHw2'), t('student.phoneHw2d'), false]].map(([tt, d, warn]) => (
                        <div key={tt} className="flex items-center justify-between py-1">
                          <span className="text-[11px] text-[#334155] flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${warn ? 'bg-[#D97706]' : 'bg-[#CBD5E1]'}`} />{tt}
                          </span>
                          <span className="text-[10px] text-[#8A94A6]">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-brand-600 text-white p-3">
                      <div className="text-[10px] opacity-80">{t('student.phoneNext')}</div>
                      <div className="text-sm font-semibold mt-0.5">{t('student.phoneLesson')}</div>
                      <div className="mt-2 inline-flex text-[10px] bg-white/20 rounded px-2 py-1">{t('student.phoneGo')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Знакомо? (боль) ── */}
        <section className="border-t border-[#141416] bg-[#0D0D0F]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
            <p className="mono-label mb-4">{t('student.painLabel')}</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-10">{t('student.painTitle')}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[t('student.pain1'), t('student.pain2'), t('student.pain3'), t('student.pain4')].map((tt) => (
                <div key={tt} className="flex items-start gap-3 rounded-xl border border-[#1E1E22] bg-[#0A0A0B] p-4">
                  <span className="text-[#5A5A60] font-mono text-sm shrink-0">✕</span>
                  <span className="text-sm text-[#B4B4BA] leading-relaxed">{tt}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#1E1E22] bg-[#0A0A0B] p-4">
              <span className="font-mono text-2xl text-brand-400">→</span>
              <span className="text-[#EDEDED]">{t('student.painSolution')}</span>
            </div>
          </div>
        </section>

        {/* ── Возможности: deep-dive с макетами ── */}
        <section id="features" className="border-t border-[#141416]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 space-y-24">
            <p className="mono-label">{t('student.featLabel')}</p>

            {/* Домашки */}
            <FeatureRow
              tag={t('student.f1tag')}
              title={t('student.f1title')}
              text={t('student.f1text')}
              mockup={
                <div className="space-y-2">
                  {[[t('student.hwEssay'), t('student.hwEssayD'), t('student.hwSubmit'), null],
                    [t('student.hwWords'), t('student.hwWordsD'), t('student.hwReview'), null],
                    [t('student.hwGram'), t('student.hwGramD'), '92/100', 'grade']].map(([tt, d, s, kind]) => (
                    <div key={tt} className="flex items-center justify-between rounded-lg bg-white border border-[#EAECEF] px-3 py-2.5">
                      <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">{tt}</div>
                        <div className="text-[11px] text-[#8A94A6]">{d}</div>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-md font-medium ${
                        kind === 'grade' ? 'bg-blue-50 text-blue-700' : s === t('student.hwSubmit') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>{s}</span>
                    </div>
                  ))}
                </div>
              }
            />

            {/* Долг */}
            <FeatureRow
              reverse
              tag={t('student.f2tag')}
              title={t('student.f2title')}
              text={t('student.f2text')}
              mockup={
                <div className="rounded-xl bg-white border border-[#EAECEF] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-medium text-[#0F172A]">{t('student.debtTeacher')}</span>
                    <span className="text-[11px] text-[#8A94A6]">{t('student.debtBalance')}</span>
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <div className="text-3xl font-bold text-amber-600">120 zł</div>
                  </div>
                  <div className="h-2 rounded-full bg-[#EEF1F4] overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A94A6]">
                    <span>{t('student.debtPaid')}</span><span>{t('student.debtCharged')}</span>
                  </div>
                </div>
              }
            />

            {/* Посещаемость */}
            <FeatureRow
              tag={t('student.f3tag')}
              title={t('student.f3title')}
              text={t('student.f3text')}
              mockup={
                <div className="space-y-2">
                  {[[t('student.att1'), t('student.att1s'), 'ok'], [t('student.att2'), t('student.att2s'), 'no'], [t('student.att3'), t('student.att3s'), 'wait']].map(([tt, s, k]) => (
                    <div key={tt} className="flex items-center justify-between rounded-lg bg-white border border-[#EAECEF] px-3 py-2.5">
                      <span className="text-[13px] text-[#334155]">{tt}</span>
                      <span className={`text-[11px] px-2 py-1 rounded-md font-medium ${
                        k === 'ok' ? 'bg-emerald-50 text-emerald-700' : k === 'no' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                      }`}>{s}</span>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </section>

        {/* ── Ещё коротко ── */}
        <section className="border-t border-[#141416] bg-[#0D0D0F]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                [t('student.short1t'), t('student.short1d')],
                [t('student.short2t'), t('student.short2d')],
                [t('student.short3t'), t('student.short3d')],
                [t('student.short4t'), t('student.short4d')],
              ].map(([tag, text]) => (
                <div key={tag} className="rounded-2xl border border-[#1E1E22] bg-[#0A0A0B] p-5">
                  <p className="font-mono text-[11px] text-brand-400 mb-2">// {tag}</p>
                  <p className="text-sm text-[#B4B4BA] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Как начать ── */}
        <section id="how" className="border-t border-[#141416]">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
            <p className="mono-label mb-4">{t('student.howLabel')}</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-12">{t('student.howTitle')}</h2>
            <div className="space-y-8">
              {[
                ['01', t('student.step1t'), t('student.step1d')],
                ['02', t('student.step2t'), t('student.step2d')],
                ['03', t('student.step3t'), t('student.step3d')],
              ].map(([n, title, text]) => (
                <div key={n} className="flex gap-5 items-start">
                  <div className="font-mono text-brand-400 text-xl shrink-0 w-10">{n}</div>
                  <div className="border-b border-[#1E1E22] pb-6 flex-1">
                    <h3 className="font-semibold text-[#EDEDED] text-lg">{title}</h3>
                    <p className="text-[#8A8A8F] mt-1.5 leading-relaxed max-w-xl">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="border-t border-[#141416] bg-[#0D0D0F]">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
            <p className="mono-label mb-4">{t('student.faqLabel')}</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-10">{t('student.faqTitle')}</h2>
            <div className="divide-y divide-[#1E1E22] border-t border-[#1E1E22]">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <FaqItem key={i} q={t(`student.sq${i}`)} a={t(`student.sa${i}`)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Финальный CTA ── */}
        <section className="border-t border-[#141416] relative overflow-hidden">
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
            <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight leading-[1.05]">
              {t('student.ctaTitle1')}<br />{t('student.ctaTitle2')}
            </h2>
            <div className="mt-9 flex flex-wrap gap-3 justify-center">
              <button onClick={toRegister}
                className="h-12 px-7 rounded-lg bg-white text-[#0A0A0B] text-[15px] font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer">
                {t('student.createAccount')}
              </button>
              <button onClick={toLogin}
                className="h-12 px-7 rounded-lg border border-[#2A2A2E] text-[#EDEDED] text-[15px] hover:bg-white/[0.04] hover:border-[#3A3A40] transition-colors cursor-pointer">
                {tc('login')}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer + кросс-переход ── */}
      <footer className="border-t border-[#141416]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[12px] text-[#5A5A60]">{t('student.footerBrand')}</span>
          <Link to="/" className="font-mono text-[13px] text-brand-400 hover:text-brand-300">
            {t('student.footerCross')}
          </Link>
        </div>
      </footer>
    </div>
  )
}

/* Ряд «текст + макет», чередование через reverse */
function FeatureRow({ tag, title, text, mockup, reverse }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      <div className={reverse ? 'lg:order-2' : ''}>
        <p className="font-mono text-[11px] text-brand-400 mb-3">// {tag}</p>
        <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">{title}</h3>
        <p className="mt-4 text-[#8A8A8F] leading-relaxed max-w-md">{text}</p>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        <div className="rounded-2xl border border-[#1E1E22] bg-[#0A0A0B] p-4 sm:p-5">
          <div className="rounded-xl bg-[#F7F8FA] p-3 sm:p-4">{mockup}</div>
        </div>
      </div>
    </div>
  )
}

/* Аккордеон вопроса */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group">
        <span className="text-[#EDEDED] font-medium group-hover:text-white transition-colors">{q}</span>
        <span className={`font-mono text-[#5A5A60] shrink-0 transition-transform ${open ? 'rotate-45 text-brand-400' : ''}`}>+</span>
      </button>
      {open && <p className="pb-4 -mt-1 text-sm text-[#8A8A8F] leading-relaxed max-w-2xl">{a}</p>}
    </div>
  )
}
