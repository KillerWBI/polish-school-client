# Frontend — Прогресс разработки

## Легенда
- ✅ Готово и работает
- 🟡 Есть, но с проблемами
- 🔴 Критически сломано
- ❌ Не начато

---

## Инфраструктура ✅

| Задача | Статус |
|--------|--------|
| Vite 8 + React 19 + TailwindCSS 4 | ✅ |
| React Router DOM 7, BrowserRouter | ✅ |
| Axios + `src/api/client.js` + JWT interceptor | ✅ |
| 401 → refresh → retry → `auth:logout` event | ✅ |
| AuthContext, useAuth, PrivateRoute, RoleRoute | ✅ |
| AppLayout + Sidebar (desktop + mobile drawer) | ✅ |
| **ErrorBoundary** (lazy Sentry + fallback вместо белого экрана) | ✅ |
| **sonner Toaster** (success/error глобально) | ✅ |
| **Axios interceptor → toast** на 5xx и network-ошибках | ✅ |
| **React.lazy + Suspense** — code splitting на все страницы кроме landing/auth/dashboard | ✅ 2026-07-10 |
| **Sentry lazy** — `@sentry/react` загружается только при наличии `VITE_SENTRY_DSN` | ✅ 2026-07-10 |
| **PWA** — `manifest.webmanifest` + `sw.js` (network-first nav, cache-first static) + install-кнопка в Sidebar | ✅ |
| **AbortController в `useFetch`** — отмена при размонтировании, callId vs гонки | ✅ 2026-07-09 |
| **EmailVerificationBanner** в AppLayout | ✅ |
| **Modal focus trap** — Tab/Shift+Tab замкнуты внутри, автофокус | ✅ 2026-07-09 |
| **OG meta + robots.txt** — `og:title/description/image` в index.html; нужен `og.png` | ✅ 2026-07-09 |

---

## API-слой (`src/api/`)

| Файл | Статус | Заметка |
|------|--------|---------|
| `auth.api.js` | ✅ | login, register (teacher/student), fetchMe, forgot/reset-password |
| `client.js` | ✅ | JWT Bearer + 401→refresh→retry + withCredentials |
| `groups.api.js` | ✅ | полный CRUD + students + generateLessons + placeholder + invitations; `getGroups(signal)` |
| `lessons.api.js` | ✅ | CRUD + params |
| `students.api.js` | ✅ | `getMyStudents(signal)`, `mergeStudent`, `deletePlaceholder` |
| `homework.api.js` | ✅ | create/delete/getAll/submit/getSubmissions/grade; quiz-attempt endpoints |
| `attendance.api.js` | ✅ | get, save (delete+insert), `getPendingAttendance(signal)`, confirmAttendance, resolveDispute |
| `payments.api.js` | ✅ | `getDebt(signal)`, `getDebtsForTeacher(signal)`, recordPayment, getPaymentHistory |
| `individualLessons.api.js` | ✅ | CRUD + `?individualCourseId=` |
| `individualCourses.api.js` | ✅ | CRUD + generateIndividualLessons; `getIndividualCourses(signal)` |
| `invitations.api.js` | ✅ | searchStudent, inviteToGroup, getInvitations, respondInvitation |
| `analytics.api.js` | ✅ | getTeacherAnalytics, getStudentAnalytics |
| `dashboard.api.js` | ✅ | `getDashboard(signal)`, `getActivity(signal)` |
| `quizzes.api.js` | ✅ | generate, save, list, get; `getQuizzes(signal)` |
| `admin.api.js` | ✅ | getAdminStats, getAdminUsers, deactivateUser, activateUser, setUserRole, setUserPlan |

---

## Страницы

| Страница | Путь | Статус | Lazy? |
|----------|------|--------|-------|
| LandingPage | `/` | ✅ | Eager |
| StudentLandingPage | `/for-students` | ✅ | Eager |
| AuthPage (login/register teacher/register student) | `/login`, `/register`, `/register-student` | ✅ | Eager |
| ForgotPasswordPage | `/forgot-password` | ✅ | Eager |
| ResetPasswordPage | `/reset-password` | ✅ | Eager |
| VerifyEmailPage | `/verify-email` | ✅ | Eager |
| DashboardPage (teacher + student, KPI/analytics/activity) | `/dashboard` | ✅ | Eager |
| CalendarPage (FullCalendar, события групп+инд.) | `/calendar` | ✅ | ✅ Lazy |
| GroupsPage (CRUD + пагинация 12/стр + инвайты ученика) | `/groups` | ✅ | ✅ Lazy |
| GroupDetailPage (уроки/ДЗ/студенты/посещаемость/настройки; заглушки+merge) | `/groups/:id` | ✅ | ✅ Lazy |
| StudentsPage (ростер, поиск, пагинация) | `/students` | ✅ | ✅ Lazy |
| HomeworkPage (teacher: create/grade/quiz; student: submit/quiz) | `/homework` | ✅ | ✅ Lazy |
| AttendancePage (3 таба: Журнал/Ожидают/Спорные; dual-confirm) | `/attendance` | ✅ | ✅ Lazy |
| PaymentsPage (teacher: долги+история; student: долг по учителям) | `/payments` | ✅ | ✅ Lazy |
| PayPage (ученик: реквизиты учителя + скриншот) | `/pay/:teacherId` | ✅ | ✅ Lazy |
| SettingsPage (личные данные + вкладка «Способы оплаты») | `/settings` | ✅ | ✅ Lazy |
| IndividualCoursesPage (CRUD + пикер студентов) | `/individual-courses` | ✅ | ✅ Lazy |
| IndividualCourseDetailPage (детали + генерация уроков) | `/individual-courses/:id` | ✅ | ✅ Lazy |
| IndividualLessonsPage (CRUD: LessonFormModal + ConfirmDialog) | `/individual-lessons` | ✅ | ✅ Lazy |
| HelpPage (секции по ролям + кнопка «Пройти тур») | `/help` | ✅ | ✅ Lazy |
| PlansPage (Free/Pro/School, badge из реального user.plan) | `/plans` | ✅ | ✅ Lazy |
| QuizGeneratorPage (AI-генерация теста) | `/quiz` | ✅ | ✅ Lazy |
| MyQuizzesPage (история/библиотека тестов, вкладки по роли) | `/quizzes` | ✅ | ✅ Lazy |
| QuizViewPage (прохождение/просмотр теста) | `/quizzes/:id` | ✅ | ✅ Lazy |
| AdminPage (Обзор/Пользователи/Поддержка; роли/планы/деактивация) | `/admin` | ✅ | ✅ Lazy |
| VocabPage (личный словарь + SR-карточки) | `/vocab` | ✅ | ✅ Lazy |
| MyLessonsPage (трекер внешних/самостоятельных занятий) | `/my-lessons` | ✅ | ✅ Lazy |
| NotesPage (личные заметки) | `/my-notes` | ✅ | ✅ Lazy |
| ProgressPage (streak/heatmap/аналитика ученика) | `/my-progress` | ✅ | ✅ Lazy |
| MaterialsPage (материалы уроков, обе роли) | `/materials` | ✅ | ✅ Lazy |
| TopicsPage (учебные треки — список, карточки → страница трека) | `/topics` | ✅ | ✅ Lazy |
| TopicDetailPage (роадмап + практика + карточки шага + история) | `/topics/:id` | ✅ | ✅ Lazy |
| DailySessionPage (ежедневная сессия: due-карточки всех треков + словаря) | `/study` | ✅ | ✅ Lazy |
| SupportPage (публичная форма обращений) | `/support` | ✅ | Eager |
| ProfilePage (Instagram-style + Recharts аналитика) | `/profile` | ✅ | ✅ Lazy |

---

## 🌍 Локализация (i18n)

Библиотека: `i18next` + `react-i18next` + `i18next-browser-languagedetector`. Авто-выбор языка по IP (`ipwho.is`, Польша→pl), ручной `LanguageSwitcher` (портал, в сайдбаре и хедерах лендингов). Namespaces: `common`, `landing`, `app`, `teacher` (+ будущие `student`, `help`). Языки с полными переводами: **ru / en / pl / uk**; **es/fr/de** — только `common`, остальное фолбэк на **en** (`fallbackLng`).

| Фаза | Охват | Статус |
|---|---|---|
| 0 — каркас | i18n init + гео-детект + LanguageSwitcher + common.json ×7 | ✅ |
| 1 — лендинги | LandingPage + StudentLandingPage → `landing.json` | ✅ ru/en/pl/uk |
| 2 — оболочка/auth/дашборд | Sidebar, Topbar, Auth/Forgot/Reset/Verify, баннер email, DashboardPage + аналитика → `app.json` | ✅ ru/en/pl/uk |
| 3 — страницы учителя + общие | все страницы учителя → `teacher.json`; Quiz-кластер/Calendar → `app.json` | ✅ ru/en/pl/uk |
| 4 — страницы ученика | vocab, my-lessons, notes, progress, materials, topics, support → `student.json` | ❌ |
| 5 — справка | HelpPage → `help.json` (заодно «ты»→«вы») | ❌ |
| es/fr/de | переводы landing/app/teacher (только JSON, код готов) | ❌ |

Паттерн: `useTranslation('<ns>')`; даты `toLocaleDateString(i18n.language, …)`; дни недели/месяцы через `returnObjects`-массивы; способы оплаты/статусы/роли — через ключи (не хардкод). Паритет ключей ru↔en/pl/uk проверяется скриптом-flatten + `npm run build` после каждой страницы.

---

## Что осталось (актуально 2026-07-14)

### 🌍 Локализация (в работе — приоритет)
- [ ] **Фаза 4** — страницы ученика → `student.json`
- [ ] **Фаза 5** — справка `/help` → `help.json`
- [ ] **es/fr/de** переводы landing/app/teacher (сейчас фолбэк на en)

### 🔴 Перед публичным запуском
- [ ] **Ротация секретов** — Cloudinary/Resend/пароль БД утекли в git-историю
- [ ] Чистый `db:migrate` на прод-БД (Neon); `ADMIN_EMAIL` в env
- [ ] **Хостинг бэка** — Railway trial истёк, решается
- [ ] **og.png** (1200×630) для OG-карточки

### ⏸️ Отложено (нужен домен/платёжный шлюз)
- [ ] Онлайн-оплата занятий + оплата подписки (Stripe/BLIK/P24)
- [ ] Email-уведомления (нужен домен + доменная почта)
- [ ] Free plan лимиты — показываются, не блокируются (сознательно)
- [ ] School mode; экспорт PDF/Excel; абонемент уроков ученика

### 💡 Спроектировано, ждёт команды
- [x] **Учебные треки — Фаза 1 (MVP) ✅ 2026-07-14** (роадмап+практика по шагам+разбор+обладание по подтемам+мягкий гейт). Спец: `LEARNING-TRACKS.md`. Отложено (Фаза 2+): открытый ИИ-ответ и карточки, SR/повторение, источники, i18n этих страниц.

### ⚪ Техдолг
- [ ] **TanStack Query** вместо `useFetch` (кэш/авто-refetch) — крупная задача
- [ ] **Recharts lazy в Dashboard** — `AnalyticsChart` статически в DashboardPage → в main bundle

---

## История изменений

| Дата | Что сделано |
|------|------------|
| 2026-07-16 | **Навигация: слияние «Тесты» + пересборка сайдбара + переименования.** `/quiz`+`/quizzes` → `/tests` (`TestsPage`, вкладки «Мои тесты/Создать», страницы в `embedded`-режиме). Сайдбар ученика: «Главное / С преподавателем / Самостоятельно» (убрана свалка «Инструменты»/«Финансы»). Переименования (4 языка): «Учебные треки» (было «Мои темы»), «Внешние занятия» (было «Мои занятия»), «Тесты» (было «AI-тесты»). |
| 2026-07-16 | **Подписки Paddle (sandbox).** `utils/paddle.js` — Paddle.js v2 overlay-чекаут (`Initialize` + `Checkout.open`, `customData:{userId}`); `PlansPage` — кнопка «Улучшить» открывает оплату (graceful-фолбэк «скоро», пока нет `VITE_PADDLE_*`); после `checkout.completed` — тост + рефетч `/auth/me` (план придёт из вебхука). Тип уведомления `review_due` в NotifBell (ранее). Полный цикл оплаты проверен в sandbox. |
| 2026-07-15 | **Учебные треки — источники переработаны (постоянные, на странице темы).** Источники теперь **сохраняются** (`TrackSource`) и видны **под каждым шагом прямо на странице трека** (`StepSourcesInline`) с удалением. «+ Подобрать ещё» — **анти-повтор** (не выдаёт уже показанное), «менее проверенные» (`loose`) — по запросу с пометкой. Проверка ссылок — GET (точнее ловит 404). `topics.api`: `getSources/suggestSources(loose)/deleteSource`. Старый блок источников из экрана карточек убран. |
| 2026-07-15 | **Учебные треки — Фаза 2 ЗАВЕРШЕНА (заход 4).** Слабые места (блок на `/study` — практикованные шаги с низким обладанием, клик → трек). Проверенные источники (в карточках шага `StepSources` — «Подобрать» → ИИ+проверка → только существующие книги/ссылки). Импорт из текста (`ImportCardsModal` — вставить конспект → карточки; PDF опц.). Карта знаний (`KnowledgeMap` — heatmap шагов на треке, эксп.). Напоминания `review_due` в `NotifBell`. |
| 2026-07-15 | **Учебные треки — Фаза 2 (заход 3): открытый ответ с ИИ-оценкой.** В практике шага (`StepPractice`) переключатель «Тест / Открытый ответ». В режиме открытого ответа — `OpenRunner` (textarea на вопрос → «Проверить ответы» → `gradeOpenAnswers`): ИИ ставит 0–100 + фидбек по каждому, показывает образец; баннер «средняя оценка N% · обладание». Попытка сохраняется (видна в истории/разборе). `topics.api`: `nextTopicQuiz(id,stepId,type)` + `gradeOpenAnswers`. |
| 2026-07-15 | **Учебные треки — Фаза 2 (заход 2): ежедневная сессия.** Страница `/study` (`DailySessionPage`, lazy, student) — собирает due-карточки со **всех треков + словаря** в один экран: старт-экран со счётчиком (треки/словарь) → обзор через `CardReview`. `api/study.api.js` (`getSession`/`reviewItem`). Пункт «Ежедневная сессия» в сайдбаре (раздел «Главное»). `CardReview` обобщён: `onReview(card, correct)` (передаёт всю карточку → сессия читает `kind`). |
| 2026-07-14 | **Учебные треки — Фаза 2 (заход 1): карточки шага + SR-повторение.** На каждом шаге кнопка «Карточки» → `StepCards` (генерация ИИ-набора front/back + обзор); в сайд-колонке трека блок «Повторение» (dueCount + «Повторить» due-карточек всего трека). Переиспользуемый `CardReview` (flip + Знаю/Не знаю → SR). `api/topicCards.api.js`. SR как в словаре (2^streak дн / ошибка→1ч / 5→known). |
| 2026-07-14 | **Учебные треки — Фаза 1 (переделка `/topics`).** Тема стала полноценным треком: `TopicDetailPage` (`/topics/:id`, lazy) — роадмап подтем (AI-генерация 4–8 шагов при создании), у каждого шага свой % обладания и мягкий гейт (открывается при ≥50% предыдущего, есть «открыть всё равно»); практика по шагу (`nextTopicQuiz(id, stepId)` → `QuizRunner` → `submitTopicAttempt`), сложность/EMA считаются по шагу; **сохранение явное** — попытка пишется по кнопке «Проверить» (подсказка до + зелёный баннер «Сохранено в историю · результат X/Y · обладание N%» после); **лента истории попыток с разбором** (клик → `getQuiz(attemptId)` → `QuizRunner savedAnswers` = свои/верные ответы + пояснения); модалка «Что можно изучать?» (`IdeasModal`). `TopicsPage` переписан — карточки ведут на страницу трека (убран встроенный inline-Practice). Fix: topic-практики больше не засоряют «Мои тесты». Строки ru (i18n — Фаза 4). |
| 2026-07-13/14 | **Локализация i18n — фазы 0–3 (ru/en/pl/uk).** Каркас (i18next + гео-детект по IP + `LanguageSwitcher`), оба лендинга (`landing.json`), оболочка/auth/дашборд/аналитика (`app.json`), **все страницы учителя + общие** (`teacher.json` + quiz/calendar в `app.json`). Даты по локали, дни недели/месяцы/способы оплаты/статусы/роли — через ключи. Осталось: страницы ученика (student.json), справка (help.json), es/fr/de. |
| 2026-07-12 | **Самостоятельные темы (`/topics`).** Страница `TopicsPage` (RoleRoute student, lazy): список тем с прогресс-баром обладания (цвет по уровню) + добавление/удаление; практика — генерация теста (`nextTopicQuiz`) → `QuizRunner` → `onCheck` шлёт результат (`submitTopicAttempt`), обладание пересчитывается (EMA на сервере), «Ещё тест» подстраивает сложность. `api/topics.api.js`. Sidebar «Мои темы» (`IconTarget`). Поддерживает самостоятельное обучение без преподавателя. |
| 2026-07-12 | **Контент-пасс лендингов/тарифов.** Тексты переведены в официальную форму «вы», убран сленг и обещания несуществующих AI-фич (AI-проверка ДЗ, whiteboard). FAQ учителя и ученика переписаны, отражают реальные возможности (кабинет ученика: прогресс/материалы/словарь; оплата со скрином+подтверждением). `PlansPage` — фичи выровнены под реальность (AI-генератор тестов, email-напоминания вместо «AI-проверка ДЗ»). Логика кнопки тарифа: ниже текущего → «Включено», выше → «Улучшить». Fix: axios-перехватчик не показывает «Нет связи» на отменённых (AbortController) запросах. **In-app Help ещё на «ты»** (инструктивный контент) — кандидат на отдельный пасс. |
| 2026-07-12 | **Способы оплаты — реальные вместо «Онлайн».** `METHOD` справочник +`blik/paypal/revolut/other` (цвета). `extraMethodsFromPaymentDetails(pd)` + `breakdownMethods()` — разбивка «по способам» динамическая: базовые (Наличные/Карта/Перевод) + доп.каналы учителя из реквизитов + фактические. `PayPage` — селектор способов из `teacherInfo.paymentDetails` (что учитель заполнил, то ученик и выбирает; `effectiveMethod`). Ручной ввод учителя (`TeacherDebts`) — базовые + доп.каналы. BLIK/PayPal/Revolut теперь видны как есть, «Онлайн» ушёл из выбора. |
| 2026-07-11 | **Модерация оплат ученика (фронт).** `PaymentsPage` переработан: `StatusToggle` (переключатели статусов сверху) + `ScreenshotModal` (лайтбокс скрина). **Учитель** «История оплат» → `На проверке(N) / Поступления / Отклонённые`; на проверке — карточки со скрином + «Одобрить»/«Отклонить» (модалка с причиной). **Ученик** → `В процессе / Одобрено / Отклонено`; в процессе — кнопка «Отменить заявку»; отклонённые показывают причину. `payments.api`: `getPendingPayments/approvePayment/rejectPayment/cancelMyPayment`, `?status=` в history. `PayPage` — экран «Отправлено на проверку» (не «Готово»). `NotifBell` — типы `payment_submitted/approved/rejected`. Удалён `MethodCard` (заменён статус-переключателями). |
| 2026-07-10 | **Фаза 8 — in-app уведомления.** `NotifBell` (`Topbar.jsx`) переведён с синтетического источника (дашборд-KPI) на реальный `/notifications`: загрузка при монтировании + опрос раз в 60с, бейдж непрочитанных, «Прочитать все», клик → отметка прочитанным (оптимистично) + переход по `link`. Иконки по типу события. `api/notifications.api.js`. |
| 2026-07-10 | **Фаза 7 — материалы урока.** Страница `/materials` (обе роли, lazy) — уроки с материалами, группировка по уроку, иконки по типу (link/file/text), поиск по теме/группе/названию, ссылки через `safeUrl`. `api/materials.api.js`. Sidebar «Материалы» (`IconFolder`) в «Учёбе» обеих ролей. |
| 2026-07-10 | **Фаза 6 — прогресс-центр.** Страница `/my-progress` (RoleRoute student, lazy) — 4 KPI (streak/уроков/ср.оценка/внешних часов), heatmap активности (17 недель, GitHub-style), Recharts (посещаемость Area, оценки Line), прогресс-бар ДЗ, полоса словаря (new/learning/known). Данные: `getMyProgress` + переиспользование `getStudentAnalytics`. `api/progress.api.js`. Sidebar «Прогресс» (`IconProgress`) в «Главном». |
| 2026-07-10 | **Фаза 5 — заметки ученика.** Страница `/my-notes` (RoleRoute student, lazy) — грид карточек-заметок (заголовок+текст+дата), `NoteEditor` (создание/редактирование в модалке), удаление. `api/notes.api.js`. Sidebar «Заметки» (`IconNote`) в «Инструментах». |
| 2026-07-10 | **Фаза 4 — трекер внешних занятий.** Страница `/my-lessons` (RoleRoute student, lazy) — 4 KPI (занятий/часов/долг/оплачено) + табы Занятия/Учителя/Предметы/Долг. Список с бейджами (тип, оплата), кнопка «Оплатил» (markPaid), удаление. `CreateModal` (тип external/self_study, предмет, преподаватель, дата/время, длительность, цена, тема, заметки, «уже оплачено»). Разбивки по учителям/предметам. `api/myLessons.api.js`. Sidebar «Мои занятия» (`IconNotebook`) в «Учёбе» ученика. |
| 2026-07-10 | **Фаза 3 — личный словарь.** Страница `/vocab` (RoleRoute student, lazy) — 3 таба: **Повторить** (флеш-карточки: слово→клик→перевод/пример→«Знаю»/«Не знаю»→SR-обновление на сервере), **Все слова** (счётчики new/learning/known + список с удалением), **Добавить** (форма слово/перевод/пример). `api/vocab.api.js`. Sidebar «Словарь» (`IconVocab`) в секции «Инструменты» ученика. |
| 2026-07-10 | **Фаза 2 — Support (заявки).** Публичная страница `/support` (`SupportPage.jsx`, eager) — форма имя/email/тип(вопрос/проблема/оплата)/тема/сообщение, экран «отправлено»; предзаполняется из `useAuth` если залогинен. Ссылка «поддержка» в футере лендинга. В `AdminPage` новая вкладка **«Поддержка»** (`SupportTab`): фильтры по статусу с counts, карточки обращений, `TicketModal` (полный текст + статус-селект + textarea ответа → «Только статус» / «Ответить и закрыть»). `api/support.api.js` (`submitSupportTicket`) + `admin.api.js` (`getSupportTickets`, `replySupportTicket`). |
| 2026-07-10 | **Фаза 1 — история оплат ученика.** `payments.api.getMyPaymentHistory`. В `PaymentsPage` студенческая часть обёрнута в `StudentPayments` с табами **Мой долг / История оплат** (по образцу `TeacherPayments`); `StudentPaymentHistory` — карточки-счета по способам + список с учителем (кому платил) + фильтр по датам. |
| 2026-07-10 | **Производительность — code splitting + Sentry lazy.** (1) **React.lazy:** все 18 страниц приложения (кроме Landing/Auth/Dashboard) конвертированы в `lazy()` → грузятся только при навигации. FullCalendar (69KB gzip) теперь не попадает в начальный бандл. Suspense-fallback через `<PageSpinner />` в AppLayout вокруг `<Outlet />`. (2) **Sentry lazy:** создан `utils/sentry.js` — `initSentry(dsn)` динамически импортирует `@sentry/react` только при наличии `VITE_SENTRY_DSN`; `captureException` — no-op без DSN. `main.jsx` и `ErrorBoundary.jsx` переведены на утилиту. `@sentry/react` (~50KB gzip) исключён из main bundle в dev/без-DSN окружениях. `vite build` ✅. |
| 2026-07-09 | **Технический долг T-1..T-7.** T-1 (Zod бэк): схемы `user`, `attendance`, `individualCourse`, `individualLesson`. T-2 (N+1): `getDebt` пакетные запросы. T-3 (Pagination): `Pagination.jsx` + StudentsPage + GroupsPage. T-4 (AbortController): `useFetch` + ключевые API-функции. T-5 (Skeleton loaders): GroupDetailPage, IndividualCourseDetailPage, PayPage, QuizViewPage. T-7 (httpOnly cookie): бэк ставит `access_token` cookie; `auth.js` читает cookie OR Bearer. |
| 2026-07-09 | **AdminPage** `/admin` (только admin). Вкладки: Обзор (4 KPI) + Пользователи (поиск/фильтр/роль/план/деактивация). RoleModal, PlanModal, ConfirmDialog. Portal-дропдаун. `api/admin.api.js`. |
| 2026-07-09 | **AttendancePage** — фильтр периода (Все/Сегодня/Прошедшие/Предстоящие). `PeriodFilter` + `applyPeriod`. |
| 2026-07-09 | **OG meta + robots.txt + Modal focus trap.** |
| 2026-07-08 | **AI-тесты в ДЗ (Фаза B1):** прикрепление теста к ДЗ, прохождение учеником, результаты учителю. |
| 2026-07-07 | **AI-тесты** — QuizRunner, QuizGeneratorPage, MyQuizzesPage, QuizViewPage. Роли: teacher→библиотека, student→история. |
| 2026-07-07 | **PWA** — manifest + sw.js + install-кнопка в Sidebar. |
| 2026-07-07 | **PlansPage** `/plans` — 3 тарифа, badge из реального `user.plan`. |
| 2026-07-06 | **PayPage** `/pay/:teacherId` — реквизиты учителя + upload скриншота. **PaymentsPage** — вкладки Долги/История, выбор метода в модалке. |
| 2026-07-05 | **Восстановление пароля** — ForgotPasswordPage + ResetPasswordPage. |
| 2026-07-04 | **Полный светлый SaaS-редизайн** + DashboardPage premium + AttendancePage электронный дневник. |
| 2026-07-02 | **Деплой:** все ветки приведены к `main`=прод / `dev`=работа. |
| 2026-06-28 | **C3 — приглашения** (InviteModal в GroupDetailPage, блок принятия в GroupsPage). `chatLink` кнопка в группах. |
| 2026-06-26 | **C2 — UI заглушек** (AddPlaceholderModal, MergeModal, delete заглушки в GroupDetailPage). |
| 2026-06-24 | **Разворот teacher-first** — удалён весь соц-UI (лента, каталог, публичный профиль, follow, заявки). |
| 2026-06-22 | **PaymentsPage** переписан под live-долг (charged − paid). |
| 2026-05-27 | **ProfilePage** Instagram-style + Recharts аналитика. |
| 2026-05-21 | ErrorBoundary, sonner, Axios interceptor, IndividualCoursesPage/IndividualCourseDetailPage. |
| 2026-05-20 | Все основные страницы кабинета (Groups, Homework, Attendance, Payments, Students, Calendar). |
