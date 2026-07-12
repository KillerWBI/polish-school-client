// «Что видит ученик» — телефон-макет (другой формат визуала).
export default function StudentView() {
  return (
    <section className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-14 items-center">
        {/* текст */}
        <div>
          <p className="mono-label mb-4">// сторона ученика</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.6rem] leading-[1.1] tracking-tight">
            Ученик открывает приложение и <span className="text-[#6E6E76]">сразу видит своё</span>
          </h2>
          <p className="mt-5 text-[#9A9AA1] leading-relaxed">
            Никаких «скинь расписание» и «сколько я должен?». Всё, что его касается — на одном экране, с телефона.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              ['📅', 'Расписание', 'ближайшие уроки со ссылкой на созвон'],
              ['✏️', 'Домашка', 'что задано, до какого числа, какая оценка'],
              ['✓', 'Посещаемость', 'своя — можно подтвердить или оспорить'],
              ['💰', 'Долг', 'по каждому преподавателю, честная цифра'],
              ['💬', 'Чат группы', 'переход в один клик'],
            ].map(([e, t, d]) => (
              <li key={t} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg border border-[#1E1E22] bg-[#0D0D0F] flex items-center justify-center text-sm shrink-0">{e}</span>
                <div>
                  <div className="text-sm font-medium text-[#EDEDED]">{t}</div>
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
                <div className="text-[11px] text-[#8A94A6]">Привет, Марта 👋</div>
                {/* KPI */}
                <div className="grid grid-cols-2 gap-2">
                  {[['Уроков', '2'], ['ДЗ к сдаче', '1'], ['Посещ.', '92%'], ['Долг', '200 zł']].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-white border border-[#EAECEF] p-2">
                      <div className="text-[9px] text-[#8A94A6]">{k}</div>
                      <div className="text-sm font-semibold text-[#0F172A]">{v}</div>
                    </div>
                  ))}
                </div>
                {/* урок */}
                <div className="rounded-lg bg-white border border-[#EAECEF] p-2.5">
                  <div className="text-[10px] text-[#8A94A6]">Сегодня</div>
                  <div className="text-xs font-medium text-[#0F172A] mt-0.5">18:00 · Группа</div>
                  <div className="mt-2 flex gap-1.5">
                    <span className="text-[9px] px-2 py-1 rounded bg-brand-500 text-white">Перейти на урок</span>
                    <span className="text-[9px] px-2 py-1 rounded bg-[#F1F5F9] text-[#475569]">💬 Чат</span>
                  </div>
                </div>
                {/* дз */}
                <div className="rounded-lg bg-white border border-[#EAECEF] p-2.5 flex items-center justify-between">
                  <div className="text-[11px] text-[#334155]">Упр. 5 · до 07.07</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309]">не сдано</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
