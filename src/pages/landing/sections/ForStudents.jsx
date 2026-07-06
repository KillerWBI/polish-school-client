// Секция лендинга «для учеников» — снизу, с переходом на регистрацию ученика.
// (Отдельный студенческий лендинг — следующим заходом.)
export default function ForStudents({ onStudentLanding, onLogin }) {
  return (
    <section id="students" className="bg-[#0D0D0F] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <p className="mono-label mb-4">// вы ученик?</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight max-w-2xl">
          Занимаешься с преподавателем на LinguaFlow?
        </h2>
        <p className="mt-4 text-[#8A8A8F] max-w-xl leading-relaxed">
          Заведи аккаунт ученика — и держи всё в одном месте. Преподаватель пригласит тебя
          в группу по нику, а ты сразу увидишь расписание, ДЗ и свой прогресс.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-lg font-mono text-[13px] text-[#8A8A8F]">
          {['расписание и ссылки на урок', 'ДЗ и дедлайны', 'оценки и прогресс', 'посещаемость и долг'].map((t) => (
            <div key={t} className="flex items-center gap-2.5">
              <span className="text-brand-400">$</span> {t}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={onStudentLanding}
            className="h-11 px-6 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors cursor-pointer">
            Страница для учеников →
          </button>
          <button onClick={onLogin}
            className="h-11 px-6 rounded-lg border border-[#2A2A2E] text-[#EDEDED] text-sm hover:bg-white/[0.04] hover:border-[#3A3A40] transition-colors cursor-pointer">
            Войти
          </button>
        </div>

        <p className="mt-6 font-mono text-[12px] text-[#5A5A60]">
          Вы преподаватель? Всё, что выше на странице, — для вас.
        </p>
      </div>
    </section>
  )
}
