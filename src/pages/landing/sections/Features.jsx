// «Что умеет» — не сетка, а чередующиеся развороты: текст + свой светлый макет.
// Светлые макеты на тёмном фоне подчёркивают: сам продукт — светлый.

function Row({ index, label, title, children, points, mono, reverse }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* текст */}
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-[#5A5A60]">{index}</span>
          <span className="mono-label">{label}</span>
        </div>
        <h3 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-[#EDEDED]">{title}</h3>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex gap-3 text-sm text-[#9A9AA1]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-[2px] bg-brand-500 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {mono && <p className="mt-5 font-mono text-[12px] text-[#5A5A60] border-l-2 border-[#26262B] pl-3">{mono}</p>}
      </div>
      {/* макет */}
      <div className={reverse ? 'lg:order-1' : ''}>{children}</div>
    </div>
  )
}

/* ── маленькие светлые макеты ── */
const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl bg-white border border-[#EAECEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>
)

function GroupsMock() {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] border border-[#EAECEF] p-4 space-y-2.5">
      {[['Математика · Вт/Чт', '6 учеников', '18:00'], ['Английский разговорный', '4 ученика', '19:30'], ['Индивидуально · Марта', '1 ученик', 'Пн 12:00']].map(([n, s, t], i) => (
        <Card key={i} className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-600 text-sm font-semibold">{n[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0F172A]">{n}</div>
            <div className="text-[11px] text-[#8A94A6]">{s}</div>
          </div>
          <div className="text-[11px] font-mono text-[#64748B]">{t}</div>
        </Card>
      ))}
    </div>
  )
}

function AttendanceMock() {
  const rows = [['Аня', true], ['Пётр', true], ['Марта', false], ['Иван', true]]
  return (
    <Card className="p-4 bg-[#F7F8FA]">
      <div className="text-xs text-[#8A94A6] mb-3 font-medium">Урок · 12 июня · 18:00</div>
      <div className="space-y-2">
        {rows.map(([n, ok]) => (
          <div key={n} className="flex items-center justify-between bg-white rounded-lg border border-[#EAECEF] px-3 py-2">
            <span className="text-sm text-[#334155]">{n}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ok ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
              {ok ? '✓ был' : '✗ не был'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-[#8A94A6]">Ученик подтверждает у себя — спорные видно сразу.</div>
    </Card>
  )
}

function HomeworkMock() {
  return (
    <Card className="p-4 bg-white max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-[#0F172A]">Упражнение 5 · Тема 3</div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600">Оценено</span>
      </div>
      <div className="mt-1 text-[11px] text-[#8A94A6]">📅 до 07 июля</div>
      <div className="mt-3 rounded-lg bg-[#F7F8FA] border border-[#EAECEF] p-3">
        <div className="text-xs text-[#64748B]">📎 файл ученика · 💬 «сделала, проверьте плз»</div>
        <div className="mt-2 text-sm font-semibold text-brand-600">🏆 92 / 100</div>
      </div>
    </Card>
  )
}

function FinanceMock() {
  return (
    <Card className="p-5 bg-white max-w-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center text-white text-sm font-semibold">М</div>
        <div>
          <div className="text-sm font-medium text-[#0F172A]">Марта К.</div>
          <div className="text-[11px] text-[#8A94A6]">6 посещений в июне</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[['Начислено', '600'], ['Оплачено', '400'], ['Остаток', '200']].map(([k, v], i) => (
          <div key={k} className={`rounded-lg border p-2 ${i === 2 ? 'border-[#FCD34D]/40 bg-[#FEF9C3]/40' : 'border-[#EAECEF] bg-[#F7F8FA]'}`}>
            <div className="text-[10px] text-[#8A94A6]">{k}</div>
            <div className={`text-sm font-semibold ${i === 2 ? 'text-[#B45309]' : 'text-[#0F172A]'}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-[#8A94A6]">Считается из посещений — руками ничего не сводишь.</div>
    </Card>
  )
}

export default function Features() {
  return (
    <section id="features" className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="mono-label mb-3">// что умеет</p>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-2xl">
          Разберём по частям — что именно вы делаете внутри
        </h2>

        <div className="mt-16 space-y-24">
          <Row index="01" label="группы и уроки" title="Группы, расписание и уроки — на автопилоте"
            points={[
              'Создаёте группу, задаёте расписание — уроки на 3 месяца вперёд генерируются сами.',
              'У урока: тема, описание, материалы (ссылки/текст), ссылка на созвон.',
              'У группы — ссылка на внешний чат (Telegram/WhatsApp), ученик переходит в один клик.',
            ]}
            mono="дубль урока на ту же дату/время? система не даст создать.">
            <GroupsMock />
          </Row>

          <Row index="02" label="посещаемость" title="Отметил — ученик подтвердил" reverse
            points={[
              'Ставите присутствие галочками. Ученик подтверждает у себя — спорные подсвечиваются.',
              'Долг за урок начисляется автоматически по цене группы.',
              'Заглушкам (без аккаунта) отметка сразу засчитывается — соло-ведение без лишних шагов.',
            ]}
            mono="present=true → +цена урока к долгу, автоматически.">
            <AttendanceMock />
          </Row>

          <Row index="03" label="дз и оценки" title="Домашка: задал → сдал → оценил"
            points={[
              'Задание на конкретный урок с дедлайном (групповой или индивидуальный).',
              'Ученик сдаёт файлом (или просто комментарием) прямо в приложении.',
              'Оценка 0–100, видна ученику; всё в одном списке со статусами.',
            ]}
            mono="статусы: не сдано · просрочено · на проверке · оценено.">
            <HomeworkMock />
          </Row>

          <Row index="04" label="финансы" title="Долг считается сам — из посещений" reverse
            points={[
              'Долг = начислено (посещения) − оплачено. По каждому ученику и учителю.',
              'Оплату вносите вручную (наличные/перевод) — баланс пересчитывается сразу.',
              'Переплата не уводит в минус — видно реальную картину.',
            ]}
            mono="никаких помесячных табличек — цифра всегда актуальна.">
            <FinanceMock />
          </Row>
        </div>
      </div>
    </section>
  )
}
