import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

/* ─── Примитивы визуализации ─────────────────────────────────
   Mark — подсветка элемента (кольцо + подпись «о чём вопрос»).
   Shot — «мини-скриншот» интерфейса, в котором показываем нужное. */
function Mark({ label, children }) {
  return (
    <div className="relative inline-flex">
      <div className="rounded-xl ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50">{children}</div>
      {label && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-sm z-10">
          {label}
        </span>
      )}
    </div>
  )
}
function Shot({ children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-center min-h-[132px] overflow-hidden">
      {children}
    </div>
  )
}
const Btn = ({ children, tone = 'primary' }) => {
  const t = tone === 'primary' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
  return <span className={`inline-flex h-9 px-4 items-center rounded-xl text-sm font-medium ${t}`}>{children}</span>
}
const Cell = ({ ch, tone }) => {
  const map = { green: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-700', empty: 'bg-white text-slate-300' }
  return <span className={`w-9 h-9 inline-flex items-center justify-center rounded-md text-sm font-semibold border border-slate-100 ${map[tone]}`}>{ch}</span>
}

/* ─── Контент справки для УЧИТЕЛЯ ──────────────────────────── */
const TEACHER_SECTIONS = [
  {
    id: 'dashboard', title: 'Дашборд', items: [
      { q: 'Что показывают карточки сверху?', a: 'Это KPI: долг учеников, уроки на сегодня, ДЗ к проверке и средняя посещаемость — быстрый срез по кабинету.',
        visual: <Shot><div className="grid grid-cols-2 gap-2">
          <Mark label="долг учеников"><div className="w-28 rounded-xl bg-white border border-slate-200 p-2.5"><div className="text-[9px] text-slate-400">Долг</div><div className="text-sm font-semibold text-amber-600">2 340 zł</div></div></Mark>
          {[['Уроки сегодня', '3'], ['ДЗ к проверке', '5'], ['Посещаемость', '92%']].map(([k, v]) => (
            <div key={k} className="w-28 rounded-xl bg-white border border-slate-200 p-2.5"><div className="text-[9px] text-slate-400">{k}</div><div className="text-sm font-semibold text-slate-900">{v}</div></div>
          ))}
        </div></Shot> },
      { q: 'Что за график и что такое «потенциал»?', a: 'Доход и долг по периодам: оплачено (зелёный), не оплачено (жёлтый) и потенциал — сколько ещё принесут будущие уроки без посещений.',
        visual: <Shot><Mark label="доход · долг · потенциал"><div className="flex items-end gap-1.5 h-20 rounded-lg bg-white border border-slate-200 px-3 py-2">{[50, 70, 45, 85, 60].map((h, i) => <div key={i} className="w-3 rounded-t bg-blue-500/80" style={{ height: `${h}%` }} />)}</div></Mark></Shot> },
      { q: 'Как быстро что-то создать?', a: 'Кнопка «Создать» на дашборде — быстрый доступ: новая группа, ДЗ или запись об оплате, не переходя по разделам.',
        visual: <Shot><Mark label="быстрое создание"><Btn>+ Создать</Btn></Mark></Shot> },
    ],
  },
  {
    id: 'groups', title: 'Группы', items: [
      { q: 'Как создать группу?', a: 'Кнопка «+ Создать группу»: задаёшь название, цену за урок, расписание (дни/время) и, по желанию, ссылку на чат. Уроки на 3 месяца сгенерируются сами.',
        visual: <Shot><Mark label="создать группу"><Btn>+ Создать группу</Btn></Mark></Shot> },
      { q: 'Как добавить ученика без регистрации (заглушку)?', a: 'Внутри группы → «+ Заглушка»: вводишь имя и контакт. Ученику ничего не приходит, по нему сразу считаются посещаемость и долг. Позже перенесёшь на реальный аккаунт.',
        visual: <Shot><div className="flex gap-2"><Mark label="без аккаунта"><Btn tone="ghost">+ Заглушка</Btn></Mark><Btn tone="ghost">+ Пригласить</Btn><Btn>+ Добавить</Btn></div></Shot> },
      { q: 'Как пригласить реального ученика?', a: 'Внутри группы → «+ Пригласить»: находишь ученика по нику (@username) и отправляешь приглашение в группу — он принимает у себя.',
        visual: <Shot><div className="flex gap-2"><Btn tone="ghost">+ Заглушка</Btn><Mark label="по нику @username"><Btn tone="ghost">+ Пригласить</Btn></Mark></div></Shot> },
      { q: 'Как добавить или изменить урок группы?', a: 'Внутри группы → вкладка «Уроки» → «+ Урок»: дата, время, тема. Там же урок можно открыть, отредактировать или удалить. При создании группы с расписанием уроки на 3 месяца создаются сами.',
        visual: <Shot><div className="flex gap-1 p-1 rounded-xl bg-slate-100"><span className="px-3 py-1 rounded-lg text-xs text-slate-500">Студенты</span><Mark label="уроки группы"><span className="px-3 py-1 rounded-lg text-xs bg-white text-blue-700 shadow-sm">Уроки</span></Mark><span className="px-3 py-1 rounded-lg text-xs text-slate-500">Настройки</span></div></Shot> },
      { q: 'Где ссылка на чат группы?', a: 'В настройках группы можно указать ссылку на внешний чат (Telegram/WhatsApp) — она появится кнопкой «Чат группы» в шапке группы и в карточке урока.',
        visual: <Shot><Mark label="внешний чат"><span className="inline-flex h-9 px-4 items-center rounded-xl bg-white border border-slate-200 text-sm text-blue-600">💬 Чат группы</span></Mark></Shot> },
      { q: 'Заглушка завела аккаунт — как перенести историю?', a: 'У заглушки в группе жми «Перенести» и выбери её реальный аккаунт — вся посещаемость, оплаты и ДЗ перепривяжутся, заглушка удалится. Ничего не теряется.',
        visual: <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2"><span className="text-xs text-slate-900 flex-1">Иван (заглушка)</span><Mark label="перенос истории"><span className="text-xs text-blue-600 font-medium">Перенести</span></Mark></div></Shot> },
    ],
  },
  {
    id: 'homework', title: 'Домашние задания', items: [
      { q: 'Как задать домашку?', a: '«+ Создать ДЗ»: пишешь описание, выбираешь урок (групповой или индивидуальный) и дедлайн. Ученики увидят её у себя со сроком.',
        visual: <Shot><Mark label="создать ДЗ"><Btn>+ Создать ДЗ</Btn></Mark></Shot> },
      { q: 'Как проверить сдачи и поставить оценку?', a: 'Открываешь ДЗ → видишь сдачи учеников (файл/комментарий) и статусы. Вводишь оценку 0–100 — она появится у ученика.',
        visual: <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs"><span className="text-slate-700 font-medium">Анна</span><span className="text-slate-400">на проверке</span></div>
          <Mark label="оценка 0–100"><div className="flex items-center gap-2"><span className="w-16 h-8 rounded-lg border border-slate-200 bg-slate-50 inline-flex items-center px-2 text-xs text-slate-400">оценка</span><Btn>Поставить</Btn></div></Mark>
        </div></Shot> },
    ],
  },
  {
    id: 'attendance', title: 'Посещаемость (журнал)', items: [
      { q: 'Как отметить посещаемость?', a: 'В журнале (сетка ученики × даты) кликаешь по ячейке: ✓ был / Н не был. Клик по дате в шапке отмечает весь урок присутствующими. Внизу — «Сохранить».',
        visual: <Shot><div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-14">Анна</span><Cell ch="✓" tone="green" /><Mark label="клик = был / не был"><Cell ch="Н" tone="red" /></Mark><Cell ch="·" tone="empty" /></div></Shot> },
      { q: 'Что значат цвета?', a: 'Зелёный ✓ — был (подтверждено), красный Н — не был, жёлтый — ждёт подтверждения ученика или спор. Синяя рамка — не сохранено.',
        visual: <Shot><div className="flex gap-2 items-center"><Cell ch="✓" tone="green" /><Cell ch="Н" tone="red" /><Mark label="ждёт / спор"><Cell ch="✓" tone="amber" /></Mark></div></Shot> },
      { q: 'Откуда берутся «Спорные» и что с ними делать?', a: 'Если ученик оспорил отметку — запись попадает во вкладку «Спорные». Там ты «Принимаешь версию ученика» или «Настаиваешь на своём» — спор закрывается.',
        visual: <Shot><div className="flex gap-1 p-1 rounded-xl bg-slate-100"><span className="px-3 py-1 rounded-lg text-xs text-slate-500">Журнал</span><span className="px-3 py-1 rounded-lg text-xs text-slate-500">Ожидают</span><Mark label="разрешить спор"><span className="px-3 py-1 rounded-lg text-xs bg-white text-blue-700 shadow-sm">Спорные</span></Mark></div></Shot> },
      { q: 'Как отметить индивидуальные занятия?', a: 'Переключись на «Индивидуальные» — там список инд. уроков, у каждого кнопки ✓ (был) / Н (не был). У заглушек посещение подтверждается сразу.',
        visual: <Shot><div className="w-60 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2"><span className="text-xs text-slate-700 flex-1">Пн 18:00 · Olena</span><Mark label="был / не был"><div className="flex gap-1"><span className="w-8 h-7 rounded-lg bg-emerald-50 text-emerald-600 text-xs inline-flex items-center justify-center">✓</span><span className="w-8 h-7 rounded-lg bg-red-50 text-red-600 text-xs inline-flex items-center justify-center">Н</span></div></Mark></div></Shot> },
    ],
  },
  {
    id: 'payments', title: 'Финансы', items: [
      { q: 'Как внести оплату ученика?', a: 'На странице «Финансы» у нужного ученика — «Внести», указываешь сумму. Остаток пересчитается сразу.',
        visual: <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
          <div className="flex-1"><div className="text-xs font-medium text-slate-900">Пётр</div><div className="text-[10px] text-amber-600">долг 528 zł</div></div>
          <Mark label="внести оплату"><Btn>Внести</Btn></Mark>
        </div></Shot> },
      { q: 'Как считается долг?', a: 'Долг = начислено − оплачено. Начислено — сумма цен уроков, где ученик был отмечен присутствующим; оплачено — сумма внесённых оплат.',
        visual: <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3">
          <Mark label="начислено − оплачено"><div className="w-full"><div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: '75%' }} /></div><div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>оплачено 792</span><span>начислено 1320</span></div></div></Mark>
        </div></Shot> },
    ],
  },
  {
    id: 'students', title: 'Ученики', items: [
      { q: 'Где список моих учеников?', a: 'Раздел «Ученики» — весь твой ростер: реальные (с аккаунтом) и заглушки. Есть поиск по имени/нику. Бейдж «заглушка» отмечает учеников без аккаунта.',
        visual: <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
          <div className="flex-1"><div className="text-xs font-medium text-slate-900">Иван</div></div>
          <Mark label="без аккаунта"><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">заглушка</span></Mark>
        </div></Shot> },
    ],
  },
  {
    id: 'calendar', title: 'Расписание', items: [
      { q: 'Что показывает календарь?', a: 'Все уроки по датам: групповые (синие) и индивидуальные (розовые). Клик по уроку — детали и ссылка на занятие.',
        visual: <Shot><div className="flex gap-2"><Mark label="групповой урок"><span className="text-[11px] px-2 py-1 rounded bg-blue-600 text-white">18:00 группа</span></Mark><span className="text-[11px] px-2 py-1 rounded bg-pink-700 text-white">16:00 инд.</span></div></Shot> },
    ],
  },
  {
    id: 'individual-courses', title: 'Индивидуальные курсы', items: [
      { q: 'Как создать курс и уроки к нему?', a: 'Создаёшь инд. курс с учеником и расписанием. Внутри курса: «Сгенерировать серию» (по расписанию) или «+ Урок» (добавить один вручную).',
        visual: <Shot><div className="flex gap-2"><Mark label="один урок"><Btn>+ Урок</Btn></Mark><Btn tone="ghost">Сгенерировать серию</Btn></div></Shot> },
    ],
  },
  {
    id: 'individual-lessons', title: 'Индивидуальные уроки', items: [
      { q: 'Как создать разовый урок?', a: '«+ Создать урок»: выбираешь ученика (из ростера или заглушку), дату, время, цену. Урок появится в списке и календаре.',
        visual: <Shot><Mark label="разовый урок"><Btn>+ Создать урок</Btn></Mark></Shot> },
    ],
  },
  {
    id: 'profile', title: 'Профиль и безопасность', items: [
      { q: 'Как сменить пароль или данные профиля?', a: 'В «Профиле» есть табы: «Профиль» (имя, ник, био, соцсети), «Аналитика» и «Безопасность» (смена пароля).',
        visual: <Shot><div className="flex gap-1 border-b border-slate-200"><span className="px-3 py-1.5 text-xs text-slate-500">Профиль</span><span className="px-3 py-1.5 text-xs text-slate-500">Аналитика</span><Mark label="смена пароля"><span className="px-3 py-1.5 text-xs text-blue-700 border-b-2 border-blue-600">Безопасность</span></Mark></div></Shot> },
      { q: 'Как поставить аватар и обложку?', a: 'В «Профиле» наведи на аватар или обложку и нажми «Заменить» — загрузишь картинку со своего устройства.',
        visual: <Shot><Mark label="загрузить фото"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg">📷</div></Mark></Shot> },
      { q: 'Зачем нужен ник (@username)?', a: 'По нику вас находят для приглашений: преподаватель ищет ученика по нику, чтобы позвать в группу. Свой ник задаёшь в «Профиле».',
        visual: <Shot><Mark label="для приглашений"><span className="inline-flex h-9 px-4 items-center rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-700">@anna_k</span></Mark></Shot> },
    ],
  },
  {
    id: 'quiz', title: 'AI-тесты', items: [
      { q: 'Как создать тест?', a: 'В «Инструменты → AI-тесты» задай тему, число вопросов, сложность и тип — AI соберёт тест с готовыми ответами. Работает для любого предмета.',
        visual: <Shot><Mark label="тема → тест"><Btn>✨ Сгенерировать</Btn></Mark></Shot> },
      { q: 'Как сохранить тест?', a: 'После генерации нажми «Сохранить тест» — он попадёт в «Мои тесты» (твою библиотеку). Оттуда можно пройти для предпросмотра, а позже прикрепить к ДЗ.',
        visual: <Shot><Mark label="в библиотеку"><Btn>Сохранить тест</Btn></Mark></Shot> },
      { q: 'Где мои тесты и как их пройти?', a: 'Раздел «Мои тесты» — все сохранённые. Открываешь тест → выбираешь ответы и «Проверить» (увидишь результат) или «Показать ключ».',
        visual: <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2"><span className="text-xs text-slate-900 flex-1">Дроби · 5 вопр.</span><Mark label="открыть и пройти"><span className="text-xs text-blue-600 font-medium">→</span></Mark></div></Shot> },
    ],
  },
  {
    id: 'video-calls', title: 'Видеозвонки', items: [
      { q: 'Как войти на урок?', a: 'В карточке урока (группа → Уроки, или Расписание) есть кнопка «Войти в урок» — она открывает видеовстречу Jitsi в новой вкладке. Ссылка создаётся автоматически при создании урока.',
        visual: <Shot><Mark label="открывает встречу"><span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-600 text-white text-sm font-medium">Войти в урок →</span></Mark></Shot> },
      { q: 'Как стать модератором встречи (управлять участниками)?', a: 'При входе в Jitsi нажми «Я организатор» и войди через Google или GitHub — тогда ты получишь права модератора: отключение микрофона, запись, выдворение.',
        visual: <Shot><div className="w-60 rounded-xl bg-white border border-slate-200 p-3 space-y-2"><div className="text-[10px] text-slate-500">При входе в Jitsi:</div><Mark label="→ войди через Google/GitHub"><span className="inline-flex h-8 px-3 items-center rounded-lg border border-slate-200 text-xs text-slate-700">Я организатор</span></Mark></div></Shot> },
      { q: 'Как изменить ссылку на урок?', a: 'Открой урок → «Редактировать» → поле «Ссылка на урок». Можно вставить свою ссылку (Zoom, Meet) или сгенерировать новую кнопкой «↻ Новая Jitsi».',
        visual: <Shot><div className="flex gap-2 items-center"><Mark label="своя или новая Jitsi"><span className="inline-flex h-8 px-3 items-center rounded-lg bg-slate-100 text-xs text-slate-700">↻ Новая Jitsi</span></Mark></div></Shot> },
    ],
  },
  {
    id: 'plans', title: 'Тарифы', items: [
      { q: 'Что такое тарифы и чем они отличаются?', a: 'Free — бесплатно, базовые возможности (ограниченное число групп и учеников). Pro — снятые лимиты и приоритетная поддержка. School — несколько учителей под одним брендом (в разработке).',
        visual: <Shot><div className="flex gap-2"><Mark label="текущий"><span className="text-[10px] px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-medium">Free</span></Mark><span className="text-[10px] px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 font-medium">Pro</span><span className="text-[10px] px-2 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-600 font-medium">School</span></div></Shot> },
      { q: 'Где посмотреть свой тариф и как улучшить?', a: 'Твой тариф — маленький бейдж рядом с именем в левом сайдбаре. Кликни на него — попадёшь на страницу «Тарифы», там описание и кнопка «Улучшить».',
        visual: <Shot><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-500" /><div className="text-xs text-slate-900">Мария П.</div><Mark label="кликни → /plans"><span className="text-[9px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">Free</span></Mark></div></Shot> },
    ],
  },
  {
    id: 'pwa', title: 'Установка как приложение', items: [
      { q: 'Как установить LinguaFlow на телефон (Android / iPhone)?', a: 'Android: открой сайт в Chrome → три точки (⋮) → «Добавить на главный экран» → «Установить». iPhone: открой в Safari → кнопка «Поделиться» (прямоугольник со стрелкой) → «На экран «Домой»».',
        visual: <Shot><div className="flex gap-3 items-start"><div className="text-center"><span className="block text-xs font-medium text-slate-700 mb-1">Android</span><div className="text-[9px] text-slate-500 leading-relaxed">Chrome → ⋮ →<br/>Добавить на<br/>главный экран</div></div><div className="w-px bg-slate-200" /><div className="text-center"><span className="block text-xs font-medium text-slate-700 mb-1">iPhone</span><div className="text-[9px] text-slate-500 leading-relaxed">Safari → □↑ →<br/>На экран<br/>«Домой»</div></div></div></Shot> },
      { q: 'Как установить на компьютер?', a: 'В Chrome/Edge в адресной строке появляется значок «Установить» (экран со стрелкой) — кликни и подтверди. Или через меню: «Установить LinguaFlow». После установки откроется как отдельное окно без браузера.',
        visual: <Shot><Mark label="в адресной строке браузера"><div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 w-56"><span className="flex-1">app.linguaflow...</span><span className="text-blue-600">⊕</span></div></Mark></Shot> },
      { q: 'Будет ли работать без интернета?', a: 'Частично: страницы, которые уже были открыты, загрузятся из кэша. Создавать уроки и вносить данные без сети нельзя — нужна синхронизация с сервером.',
        visual: <Shot><div className="w-52 rounded-xl bg-white border border-slate-200 p-3 space-y-1"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-600">Кэш страниц — доступно</span></div><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[10px] text-slate-600">Создание данных — нет</span></div></div></Shot> },
    ],
  },
]

/* ─── Контент справки для УЧЕНИКА ──────────────────────────── */
const STUDENT_SECTIONS = [
  {
    id: 'dashboard', title: 'Дашборд', items: [
      { q: 'Что показывает главный экран?', a: 'Твой срез: уроков на неделе, ДЗ к сдаче, посещаемость и долг. Плюс ближайшие уроки и последние оценки.',
        visual: <Shot><div className="grid grid-cols-2 gap-2">
          <div className="w-28 rounded-xl bg-white border border-slate-200 p-2.5"><div className="text-[9px] text-slate-400">Уроков</div><div className="text-sm font-semibold text-slate-900">3</div></div>
          <Mark label="что сдать"><div className="w-28 rounded-xl bg-white border border-slate-200 p-2.5"><div className="text-[9px] text-slate-400">ДЗ к сдаче</div><div className="text-sm font-semibold text-amber-600">2</div></div></Mark>
        </div></Shot> },
    ],
  },
  {
    id: 'groups', title: 'Мои группы', items: [
      { q: 'Как принять приглашение в группу?', a: 'На «Мои группы» сверху появляется блок «Приглашения» — жми «Принять», и группа добавится. Пригласить тебя может преподаватель по нику.',
        visual: <Shot><div className="w-64 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2"><span className="text-xs text-slate-900 flex-1">Группа · от Марии</span><span className="text-xs text-slate-400">Отклонить</span><Mark label="вступить"><Btn>Принять</Btn></Mark></div></Shot> },
    ],
  },
  {
    id: 'homework', title: 'Домашние задания', items: [
      { q: 'Как сдать домашку?', a: 'Открываешь задание → «Сдать»: прикрепляешь файл (PDF/фото) или пишешь комментарий и отправляешь — до дедлайна.',
        visual: <Shot><Mark label="прикрепить и отправить"><Btn>📤 Сдать задание</Btn></Mark></Shot> },
      { q: 'Где увидеть оценку?', a: 'После проверки оценка (0–100) появляется прямо в карточке задания со статусом «Оценено».',
        visual: <Shot><Mark label="оценка после проверки"><span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">✓ Оценено: 92/100</span></Mark></Shot> },
    ],
  },
  {
    id: 'attendance', title: 'Посещаемость', items: [
      { q: 'Как подтвердить, был ли я на уроке?', a: 'Во вкладке «Подтвердить» по каждому уроку жмёшь «Был» или «Не был». Если учитель отметил неверно — оспорь, спор увидит учитель.',
        visual: <Shot><div className="flex gap-2"><Mark label="подтвердить"><span className="h-8 px-3 inline-flex items-center rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium">Был</span></Mark><span className="h-8 px-3 inline-flex items-center rounded-lg bg-red-50 text-red-600 text-xs">Не был</span></div></Shot> },
    ],
  },
  {
    id: 'payments', title: 'Финансы', items: [
      { q: 'Где увидеть свой долг?', a: 'На «Финансах» — долг по каждому преподавателю: начислено, оплачено и остаток. Считается автоматически по твоим занятиям.',
        visual: <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3"><div className="text-xs font-medium text-slate-900 mb-1">Мария П.</div><Mark label="остаток к оплате"><div className="text-lg font-semibold text-amber-600">120 zł</div></Mark></div></Shot> },
    ],
  },
  {
    id: 'calendar', title: 'Расписание', items: [
      { q: 'Где расписание и ссылка на урок?', a: 'В «Расписании» видны все твои уроки. Клик по уроку — детали и кнопка «Перейти на урок» (ссылка на созвон).',
        visual: <Shot><Mark label="ссылка на созвон"><span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-600 text-white text-sm">Перейти на урок →</span></Mark></Shot> },
    ],
  },
  {
    id: 'profile', title: 'Профиль', items: [
      { q: 'Зачем мне ник (@username)?', a: 'По нику тебя находит преподаватель, чтобы пригласить в группу. Задай ник в «Профиле», чтобы тебя могли позвать.',
        visual: <Shot><Mark label="по нему тебя найдут"><span className="inline-flex h-9 px-4 items-center rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-700">@anna_k</span></Mark></Shot> },
      { q: 'Как сменить пароль?', a: 'В «Профиле» → таб «Безопасность» → смена пароля. Забыл пароль — на странице входа есть «Забыли пароль?».',
        visual: <Shot><div className="flex gap-1 border-b border-slate-200"><span className="px-3 py-1.5 text-xs text-slate-500">Профиль</span><Mark label="смена пароля"><span className="px-3 py-1.5 text-xs text-blue-700 border-b-2 border-blue-600">Безопасность</span></Mark></div></Shot> },
    ],
  },
  {
    id: 'quiz', title: 'AI-тесты', items: [
      { q: 'Как сделать тест для себя?', a: 'В «Инструменты → AI-тесты» задай тему (любой предмет), число вопросов и тип — AI соберёт тест. Удобно для самопроверки перед контрольной.',
        visual: <Shot><Mark label="тема → тест"><Btn>✨ Сгенерировать</Btn></Mark></Shot> },
      { q: 'Как пройти и сохранить результат?', a: 'Выбираешь ответы → «Проверить» (увидишь, сколько верно) → «Сохранить результат». Прохождение с оценкой попадёт в твою историю.',
        visual: <Shot><Mark label="оценка + сохранение"><span className="inline-flex items-center h-8 px-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">Результат: 4 / 5</span></Mark></Shot> },
      { q: 'Где моя история тестов?', a: 'Раздел «Мои тесты» — все пройденные, с твоим результатом. Открываешь — видишь свои ответы и правильные.',
        visual: <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2"><span className="text-xs text-slate-900 flex-1">Дроби · 5 вопр.</span><Mark label="твой счёт"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">4/5</span></Mark></div></Shot> },
    ],
  },
  {
    id: 'video-calls', title: 'Видеозвонки', items: [
      { q: 'Как войти на урок?', a: 'В карточке урока (Расписание или Мои группы → урок) есть кнопка «Войти в урок» — кликни, откроется видеовстреча в новой вкладке. Без регистрации.',
        visual: <Shot><Mark label="открывает встречу"><span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-600 text-white text-sm font-medium">Войти в урок →</span></Mark></Shot> },
      { q: 'Нужно ли создавать аккаунт для видеозвонка?', a: 'Нет. Как ученик заходишь сразу — достаточно кликнуть «Войти в урок» и разрешить камеру/микрофон в браузере.',
        visual: <Shot><div className="flex items-center gap-2 text-xs text-slate-600"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center">✓</span> Без регистрации</div></Shot> },
    ],
  },
  {
    id: 'pwa', title: 'Установка как приложение', items: [
      { q: 'Как установить LinguaFlow на телефон (Android / iPhone)?', a: 'Android: открой сайт в Chrome → три точки (⋮) → «Добавить на главный экран» → «Установить». iPhone: открой в Safari → кнопка «Поделиться» (прямоугольник со стрелкой) → «На экран «Домой»».',
        visual: <Shot><div className="flex gap-3 items-start"><div className="text-center"><span className="block text-xs font-medium text-slate-700 mb-1">Android</span><div className="text-[9px] text-slate-500 leading-relaxed">Chrome → ⋮ →<br/>Добавить на<br/>главный экран</div></div><div className="w-px bg-slate-200" /><div className="text-center"><span className="block text-xs font-medium text-slate-700 mb-1">iPhone</span><div className="text-[9px] text-slate-500 leading-relaxed">Safari → □↑ →<br/>На экран<br/>«Домой»</div></div></div></Shot> },
      { q: 'Как установить на компьютер?', a: 'В Chrome/Edge в адресной строке появляется значок «Установить» — кликни и подтверди. После установки LinguaFlow откроется как отдельное окно.',
        visual: <Shot><Mark label="в адресной строке браузера"><div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 w-56"><span className="flex-1">app.linguaflow...</span><span className="text-blue-600">⊕</span></div></Mark></Shot> },
    ],
  },
]

export default function HelpPage() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { isTeacher } = useAuth()
  const sections = isTeacher ? TEACHER_SECTIONS : STUDENT_SECTIONS

  // Скролл к нужной секции по якорю (из кнопки «?» на странице)
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [hash])

  // Запуск интерактивного тура: уходим на дашборд и стартуем после отрисовки.
  const startTour = () => {
    navigate('/dashboard')
    setTimeout(() => window.dispatchEvent(new Event('lf:tour-start')), 400)
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6 max-w-4xl mx-auto flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Помощь</h1>
          <p className="text-sm text-slate-500 mt-0.5">Как что делать в кабинете — коротко, с подсказками прямо на элементах.</p>
        </div>
        {isTeacher && (
          <button onClick={startTour}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer">
            <span className="text-[10px]">▶</span> Пройти тур
          </button>
        )}
      </div>

      {/* быстрые ссылки по разделам */}
      <div className="flex flex-wrap gap-2 mb-8 max-w-4xl mx-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => navigate(`/help#${s.id}`)}
            className="text-xs px-3 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">
            {s.title}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {sections.map(s => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />{s.title}
            </h2>
            <div className="space-y-4">
              {s.items.map((it, i) => (
                <div key={i} className="grid md:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{it.q}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{it.a}</p>
                  </div>
                  <div>{it.visual}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        Не нашёл ответа? Пиши — добавим. А внутренние подсказки будем расширять: планируем интерактивный тур прямо по интерфейсу.
      </div>
    </div>
  )
}
