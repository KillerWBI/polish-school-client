import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import RoleSwitch from './sections/RoleSwitch'

// Отдельный лендинг для УЧЕНИКА (teacher-лендинг — на «/»). Тёмный тех-моно стиль бренда.
export default function StudentLandingPage() {
  const navigate = useNavigate()
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
            <span className="font-mono text-[11px] text-[#5A5A60]">/ ученику</span>
          </button>

          <nav className="hidden md:flex items-center gap-8 font-mono text-[13px] text-[#8A8A8F]">
            <button onClick={() => scrollTo('features')} className="hover:text-[#EDEDED] transition-colors cursor-pointer">возможности</button>
            <button onClick={() => scrollTo('how')}      className="hover:text-[#EDEDED] transition-colors cursor-pointer">как&nbsp;начать</button>
            <button onClick={() => scrollTo('faq')}      className="hover:text-[#EDEDED] transition-colors cursor-pointer">вопросы</button>
          </nav>

          <div className="flex items-center gap-2.5">
            <RoleSwitch active="student" />
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')}
                className="h-9 px-4 rounded-lg bg-white text-[#0A0A0B] text-[13px] font-medium hover:bg-[#EDEDED] transition-colors cursor-pointer">
                В кабинет{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </button>
            ) : (
              <>
                <button onClick={toLogin}
                  className="hidden sm:inline-flex h-9 px-3 items-center rounded-lg text-[13px] text-[#B4B4BA] hover:text-white transition-colors cursor-pointer">
                  Войти
                </button>
                <button onClick={toRegister}
                  className="h-9 px-4 rounded-lg bg-white text-[#0A0A0B] text-[13px] font-medium hover:bg-[#EDEDED] transition-colors cursor-pointer">
                  Начать
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
              <p className="mono-label mb-5">// для учеников</p>
              <h1 className="font-display font-bold tracking-tight leading-[1.03] text-[clamp(2.4rem,6vw,4.4rem)]">
                Твоя учёба —<br /><span className="text-[#6E6E76]">в одном экране.</span>
              </h1>
              <p className="mt-6 max-w-lg text-[#9A9AA1] text-base sm:text-lg leading-relaxed">
                Расписание, домашки, оценки, посещаемость и долг — <span className="text-[#EDEDED]">не в чатах и заметках</span>,
                а в личном кабинете. Бесплатно, с телефона тоже.
              </p>

              <div className="mt-8 max-w-md rounded-xl border border-[#1E1E22] bg-[#0D0D0F] font-mono text-[13px] overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 h-8 border-b border-[#1E1E22]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2E]" />
                  <span className="ml-2 text-[#5A5A60] text-[11px]">как это работает</span>
                </div>
                <div className="p-4 space-y-1.5 text-[#8A8A8F]">
                  <p><span className="text-brand-400">$</span> регистрируешься за 30 секунд</p>
                  <p><span className="text-brand-400">$</span> преподаватель зовёт по нику</p>
                  <p><span className="text-brand-400">$</span> видишь ДЗ, оценки, расписание</p>
                  <p className="text-[#EDEDED]"><span className="text-brand-400">$</span> учишься спокойно <span className="caret" /></p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={toRegister}
                  className="h-11 px-6 rounded-lg bg-white text-[#0A0A0B] text-sm font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer">
                  Создать аккаунт ученика
                </button>
                <button onClick={toLogin}
                  className="h-11 px-6 rounded-lg border border-[#2A2A2E] text-[#EDEDED] text-sm hover:bg-white/[0.04] hover:border-[#3A3A40] transition-colors cursor-pointer">
                  У меня есть аккаунт
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-[#5A5A60]">
                <span className="text-[#8A8A8F]">5 чатов и заметок</span>
                <span>→</span>
                <span className="text-brand-400">1 кабинет</span>
                <span className="text-[#2A2A2E]">·</span>
                <span>бесплатно</span>
                <span className="text-[#2A2A2E]">·</span>
                <span>с телефона</span>
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
                      <div className="text-[11px] text-[#8A94A6]">Привет,</div>
                      <div className="text-lg font-semibold text-[#0F172A] leading-tight">Аня 👋</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[['ДЗ к сдаче', '2', 'text-[#D97706]'], ['Посещаемость', '95%', 'text-[#16A34A]']].map(([k, v, c]) => (
                        <div key={k} className="rounded-xl bg-white border border-[#EAECEF] p-2.5">
                          <div className="text-[9px] text-[#8A94A6] mb-0.5">{k}</div>
                          <div className={`text-base font-semibold leading-none ${c}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-white border border-[#EAECEF] p-3">
                      <div className="text-[10px] text-[#8A94A6] mb-2">Домашка</div>
                      {[['Слова урок 5', 'до 12.07', true], ['Грамматика §3', 'до 14.07', false]].map(([t, d, warn]) => (
                        <div key={t} className="flex items-center justify-between py-1">
                          <span className="text-[11px] text-[#334155] flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${warn ? 'bg-[#D97706]' : 'bg-[#CBD5E1]'}`} />{t}
                          </span>
                          <span className="text-[10px] text-[#8A94A6]">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-brand-600 text-white p-3">
                      <div className="text-[10px] opacity-80">Ближайший урок</div>
                      <div className="text-sm font-semibold mt-0.5">Пн 18:00 · Польский A2</div>
                      <div className="mt-2 inline-flex text-[10px] bg-white/20 rounded px-2 py-1">Перейти на урок →</div>
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
            <p className="mono-label mb-4">// знакомо?</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-10">Учёба разбросана по десяти местам</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'ДЗ — где-то в переписке, дедлайн вспомнил в последний момент',
                '«А какая у меня оценка?» — спрашиваешь каждый раз',
                'Ссылка на урок потерялась в чате',
                '«Сколько я должен?» — считаете вдвоём по сообщениям',
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 rounded-xl border border-[#1E1E22] bg-[#0A0A0B] p-4">
                  <span className="text-[#5A5A60] font-mono text-sm shrink-0">✕</span>
                  <span className="text-sm text-[#B4B4BA] leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#1E1E22] bg-[#0A0A0B] p-4">
              <span className="font-mono text-2xl text-brand-400">→</span>
              <span className="text-[#EDEDED]">Всё это — в одном кабинете, где сразу видно, что делать и когда.</span>
            </div>
          </div>
        </section>

        {/* ── Возможности: deep-dive с макетами ── */}
        <section id="features" className="border-t border-[#141416]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 space-y-24">
            <p className="mono-label">// что внутри</p>

            {/* Домашки */}
            <FeatureRow
              tag="домашки"
              title="Домашки не теряются"
              text="Что задали, до какого числа и куда сдавать — в одном списке. Сдаёшь файлом или комментарием, а оценку и комментарий преподавателя видишь тут же."
              mockup={
                <div className="space-y-2">
                  {[['Эссе «Моя семья»', 'до 12.07', 'сдать', null],
                    ['Слова, урок 5', 'сдано', 'на проверке', null],
                    ['Грамматика §3', 'оценено', '92/100', 'grade']].map(([t, d, s, kind]) => (
                    <div key={t} className="flex items-center justify-between rounded-lg bg-white border border-[#EAECEF] px-3 py-2.5">
                      <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">{t}</div>
                        <div className="text-[11px] text-[#8A94A6]">{d}</div>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-md font-medium ${
                        kind === 'grade' ? 'bg-blue-50 text-blue-700' : s === 'сдать' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>{s}</span>
                    </div>
                  ))}
                </div>
              }
            />

            {/* Долг */}
            <FeatureRow
              reverse
              tag="финансы"
              title="Долг всегда понятен"
              text="Никаких «сколько я должен?». Сколько начислено за занятия и сколько оплачено — считается автоматически, остаток виден в любой момент."
              mockup={
                <div className="rounded-xl bg-white border border-[#EAECEF] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-medium text-[#0F172A]">Мария П. · преподаватель</span>
                    <span className="text-[11px] text-[#8A94A6]">Остаток</span>
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <div className="text-3xl font-bold text-amber-600">120 zł</div>
                  </div>
                  <div className="h-2 rounded-full bg-[#EEF1F4] overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A94A6]">
                    <span>Оплачено 480 zł</span><span>Начислено 600 zł</span>
                  </div>
                </div>
              }
            />

            {/* Посещаемость */}
            <FeatureRow
              tag="посещаемость"
              title="Отметки — прозрачно"
              text="Преподаватель отмечает, был ли ты на уроке, — а ты подтверждаешь или оспариваешь. Никаких «я же был», спор виден обеим сторонам."
              mockup={
                <div className="space-y-2">
                  {[['Урок 12 · 10.07', 'был', 'ok'], ['Урок 11 · 08.07', 'не был', 'no'], ['Урок 10 · 05.07', 'подтверди', 'wait']].map(([t, s, k]) => (
                    <div key={t} className="flex items-center justify-between rounded-lg bg-white border border-[#EAECEF] px-3 py-2.5">
                      <span className="text-[13px] text-[#334155]">{t}</span>
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
                ['расписание', 'Все уроки и ссылки на занятие — не забудешь и не потеряешь.'],
                ['несколько преподавателей', 'Один аккаунт — все твои преподаватели и группы.'],
                ['с телефона', 'Работает в браузере — приложение ставить не нужно.'],
                ['бесплатно', 'Аккаунт ученика бесплатный. Платишь только за занятия — преподавателю.'],
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
            <p className="mono-label mb-4">// как начать</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-12">Три шага</h2>
            <div className="space-y-8">
              {[
                ['01', 'Регистрируешься', 'Аккаунт ученика — имя, email, пароль. Полминуты.'],
                ['02', 'Преподаватель приглашает', 'Он находит тебя по нику (@username) и присылает приглашение в группу — ты принимаешь.'],
                ['03', 'Учишься удобно', 'Дальше всё под рукой: расписание, ДЗ, оценки, посещаемость и долг.'],
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
            <p className="mono-label mb-4">// вопросы</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-10">Частые вопросы</h2>
            <div className="divide-y divide-[#1E1E22] border-t border-[#1E1E22]">
              {[
                ['Что мне даёт LinguaFlow?', 'Очень многое — всю твою учёбу в одном месте: расписание со ссылками на урок, домашки с дедлайнами, оценки и прогресс, посещаемость и долг. Больше не нужно листать чаты и вспоминать, что задали и когда занятие. А дальше будет ещё удобнее — онлайн-оплата, напоминания и не только.'],
                ['Это платно для ученика?', 'Для тебя — полностью бесплатно. За сами занятия ты платишь преподавателю, а платформа удобно показывает, сколько начислено и оплачено, чтобы не считать в уме. Онлайн-оплату прямо в приложении добавим позже.'],
                ['Нужно ли устанавливать приложение?', 'Ничего ставить не надо — всё работает в браузере телефона и компьютера. Открыл сайт и учишься. Отдельное приложение (PWA) — в планах.'],
                ['Как я тут окажусь? Могу зарегистрироваться сам?', 'Легко: регистрируешься сам за 30 секунд, а преподаватель находит тебя по нику (@username) и приглашает в группу — принимаешь, и всё готово.'],
                ['Обязательно ли, чтобы преподаватель тоже был на платформе?', 'Да, ведь всё строится вокруг твоих занятий с ним. Если его тут ещё нет — расскажи про LinguaFlow: ему станет удобнее вести, а тебе — вдвойне комфортнее учиться.'],
                ['Можно учиться у нескольких преподавателей?', 'Да! Один аккаунт — сразу все твои преподаватели, группы и индивидуальные занятия. Ничего не путается и не теряется.'],
                ['Мои данные в безопасности?', 'Да, за этим следим. Твой преподаватель видит только то, что связано с вашими занятиями — ничего лишнего и никому постороннему.'],
              ].map(([q, a]) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Финальный CTA ── */}
        <section className="border-t border-[#141416] relative overflow-hidden">
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
            <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight leading-[1.05]">
              Готов учиться<br />без хаоса?
            </h2>
            <div className="mt-9 flex flex-wrap gap-3 justify-center">
              <button onClick={toRegister}
                className="h-12 px-7 rounded-lg bg-white text-[#0A0A0B] text-[15px] font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer">
                Создать аккаунт ученика
              </button>
              <button onClick={toLogin}
                className="h-12 px-7 rounded-lg border border-[#2A2A2E] text-[#EDEDED] text-[15px] hover:bg-white/[0.04] hover:border-[#3A3A40] transition-colors cursor-pointer">
                Войти
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer + кросс-переход ── */}
      <footer className="border-t border-[#141416]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[12px] text-[#5A5A60]">LinguaFlow · страница для учеников</span>
          <Link to="/" className="font-mono text-[13px] text-brand-400 hover:text-brand-300">
            Вы преподаватель? → на страницу для преподавателей
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
