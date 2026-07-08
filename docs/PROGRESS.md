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
| 401 → `auth:logout` event → AuthContext.logout() | ✅ |
| AuthContext, useAuth, PrivateRoute, RoleRoute | ✅ |
| AppLayout + Sidebar (desktop + mobile drawer) | ✅ |
| Роутинг: все рабочие страницы подключены | ✅ |
| **ErrorBoundary** (fallback вместо белого экрана) | ✅ 2026-05-21 |
| **sonner Toaster** (success/error глобально) | ✅ 2026-05-21 |
| **Axios interceptor → toast** на 5xx и network-ошибках | ✅ 2026-05-21 |

---

## API-слой (`src/api/`)

| Файл | Статус | Заметка |
|------|--------|---------|
| `auth.api.js` | ✅ | login, register, fetchMe |
| `client.js` | ✅ | JWT + 401 handler |
| `groups.api.js` | ✅ | полный CRUD + students + generateLessons |
| `lessons.api.js` | ✅ | CRUD + params |
| `students.api.js` | ✅ | getStudents, getStudent |
| `homework.api.js` | 🟡 | нет `submitHomework` |
| `attendance.api.js` | ✅ | get, save, update |
| `payments.api.js` | ✅ | get, calculate, update |
| `individualLessons.api.js` | ✅ | CRUD + params (включая `?individualCourseId=`) |
| `individualCourses.api.js` | ✅ | CRUD + `generateIndividualLessons` (2026-05-21) |

---

## Страницы

| Страница | Путь | Статус | Проблемы |
|----------|------|--------|---------|
| LandingPage | `/` | ✅ | — |
| TeacherLoginPage | `/teacher-login` | ✅ | — |
| WelcomePage | `/welcome` | ✅ | — |
| CalendarPage | `/calendar` | ✅ | — |
| GroupsPage | `/groups` | 🟡 | Форма не сбрасывается при закрытии с ошибкой |
| GroupDetailPage | `/groups/:id` | ✅ | — |
| HomeworkPage (teacher) | `/homework` | ✅ | — |
| HomeworkPage (student) | `/homework` | ✅ | Форма + Cloudinary upload + статус |
| AttendancePage (teacher) | `/attendance` | ✅ | Выбор группы → урока → галочки, тосты, key-remount на смене урока |
| AttendancePage (student) | `/attendance` | ✅ | Карточки с тостами; expandable → ДЗ урока |
| PaymentsPage | `/payments` | 🟡 | Клиентская фильтрация, может не показать все записи |
| StudentsPage | `/students` | 🟡 | Нет клика → профиль; нет пагинации |
| IndividualCoursesPage | `/individual-courses` | ✅ | CRUD + список карточек + модалка создания (2026-05-21) |
| IndividualCourseDetailPage | `/individual-courses/:id` | ✅ | Детали, редактирование, генерация уроков, удаление (2026-05-21) |
| IndividualLessonsPage | `/individual-lessons` | 🟡 | Read-only список |
| ProfilePage | `/profile` | ✅ | Смена имени + пароля |

---

## Что делать (по приоритету)

### ✅ Выполнено
- [x] `HomeworkPage` — форма сдачи ДЗ для студента (Cloudinary + `submitHomework`)
- [x] `HomeworkPage` — имя студента в SubmissionsModal
- [x] `AttendancePage` — сброс present при смене урока
- [x] `AttendancePage` — поддержка индивидуальных уроков (переключатель + форма)
- [x] `GroupDetailPage` — кнопка ручного создания урока
- [x] `GroupDetailPage` — клик на урок → детали/редактирование
- [x] `HomeworkPage` — создание ДЗ для инд. уроков (переключатель типа урока)
- [x] `CalendarPage` — ru locale для FullCalendar
- [x] `Sidebar` — ссылки на профиль, инд. курсы/уроки

### ✅ Новые страницы (минимальные реализации)
- [x] `ProfilePage` — смена имени + смена пароля
- [x] `IndividualLessonsPage` — список инд. уроков (read-only)
- [x] `IndividualCoursesPage` — заглушка «скоро»

### 🟡 Следующий блок — Профиль + Аналитика + Лендинг

> ⚠️ **Перед публичным запуском** — закрыть 4 multi-tenancy бага на backend (см. [REVIEW.md раздел 3](../../REVIEW.md#3-критичные-баги)). Фронт работает корректно, баги на backend.

#### Профиль (Instagram-style)
- [x] **Sprint C (2026-05-27):** `ProfilePage` редизайн: обложка-баннер + круглый аватар (Cloudinary), bio (300 симв.), соцсети (TG/WhatsApp/LinkedIn), языки-теги, прогресс-бар заполнения, табы Профиль/Аналитика/Безопасность
- [x] **Sprint C:** компоненты `pages/profile/components/` — Tabs, AvatarUpload, CoverUpload, LanguagesEditor (с CEFR для студента), SocialsEditor
- [x] **Sprint C:** Recharts установлен. `TeacherCharts.jsx` — Line (paid+charged 2-line), Area (студенты/месяц), плашка avgAttendance + сегментный фильтр period day/week/month
- [x] **Sprint C:** `StudentCharts.jsx` — Area посещаемость, Line оценки timeline, progress bar выполнения ДЗ
- [x] **Sprint C:** `constants/languages.js` — 13 языков + CEFR уровни
- [x] **Sprint C:** `api/profile.api.js` + `api/analytics.api.js`

#### Sprint D — UserProfilePage ✅ ГОТОВО (2026-06-17, кроме ленты)
- [x] `UserProfilePage` (`/@:username`) — профиль учителя/студента, контакты, follow, аналитика, кнопка заявки
- [x] Роут `/@:username` в `App.jsx` (свой → redirect `/profile`)
- [x] `RequestModal` — заявка (язык/уровень/сообщение/контакт с автоподстановкой)
- [x] `StudentsPage` — вкладки «Мои ученики / Заявки (N)» + accept/decline, клик → `/@username`
- [x] `GroupDetailPage` — клик на студента → `/@username`; picker на `getMyStudents`
- [x] Sidebar — «Студенты» → «Ученики» + бейдж заявок (`requests:changed` event)
- [ ] Sidebar студента «Мой учитель» — отложено (нужен источник username)
- [ ] Лента постов — §2.5.4 ROADMAP, отложена в конец Sprint D

#### Sprint E — Редизайн лендинга под мульти-сервис
- [ ] `Hero.jsx` — rotating-слово: заменить на названия языков в их написании (Polski / Français / Español / Deutsch / Italiano / 日本語 / Português / Русский / العربية); только текст, без флагов
- [ ] `Hero.jsx` — подзаголовок: переориентировать с «учитель польского» на «платформа для языковых преподавателей и их студентов»
- [ ] `About.jsx` (или аналог) — убрать «карточку одного учителя», заменить на two-column блок: для учителей (автоматизация / аналитика / материалы) / для студентов (расписание / ДЗ / прогресс)
- [ ] `Features.jsx` — карточки: переформулировать текст с первого лица на платформенный («Управляйте студентами», «Отслеживайте посещаемость»)
- [ ] `FAQ.jsx` — обновить вопросы под SaaS: «Сколько учителей работает на платформе?», «Как студент попадает к учителю?», «Есть ли бесплатный план?»
- [ ] `Header` + `Footer` — CTA разделить: «Я преподаватель» → `/teacher-login`, «Найти учителя» → `/` (или будущий каталог)

#### Остальное
- [ ] `IndividualLessonsPage` — расширить (редактирование, удаление, фильтры)
- [ ] `PaymentsPage` — серверная фильтрация по month
- [ ] **TanStack Query** вместо `useFetch`
- [ ] `httpOnly` cookie вместо `localStorage`
- [ ] Skeleton loaders вместо `<PageSpinner />`

---

## История изменений

| Дата | Что сделано |
|------|------------|
| 2026-07-09 | **Sprint 2 — безопасность, стабильность.** (1) **`safeUrl.js`** — утилита `safeUrl(url)`: пропускает только `http://`/`https://` URI, блокирует `javascript:` и другие опасные схемы. Применена в `Sidebar.jsx`/`Topbar.jsx` (`img src`), `GroupDetailPage.jsx` (`chatLink`, `lessonLink`, `m.url`). (2) **`QuizRunner.jsx`** — guard от crash при `quiz=null` или `questions=[]`: проверки после хуков (без нарушения правил хуков). |
| 2026-07-09 | **Sprint 1 — 3 bug-fixes (ревью 2026-07-08).** (1) **`IndividualCoursesPage.jsx`** — `getStudents()→GET /users` (все пользователи!) заменён на `getMyStudents()→GET /users/me/students` (только свои ученики, как везде). (2) **`QuizGeneratorPage.jsx`** — `setSaving(false)` перенесён из `catch` в `finally`: раньше при успешном сохранении кнопка зависала в loading-состоянии навсегда. (3) **`PaymentsPage.jsx`** — добавлен `ConfirmDialog` перед записью оплаты: «Внести» → валидация → диалог «Записать X zł от Y?» → только потом API. |
| 2026-07-08 | **AI-тесты в ДЗ (Фаза B1).** При создании ДЗ — селект **«Прикрепить тест»** (из сохранённой библиотеки учителя). Ученик видит в карточке ДЗ кнопку **«Пройти тест»** → модалка с тестом → «Проверить» шлёт результат **учителю и в свою историю тестов**. Учитель в модалке сдач видит секцию **«Результаты теста»**: список учеников со счётом, разворот показывает их **ответы** (QuizRunner в режиме просмотра) для анализа. Бэк: `Homework.quizId` + `Quiz.homeworkId`/`sourceQuizId` (миграция `...0001`), эндпоинты `POST/GET /homework/:id/quiz-attempt(s)`. Также фикс: создание ДЗ падало на `null` в lessonId/individualLessonId — схема → `.nullable()`. (на ветке `dev`) |
| 2026-07-08 | **AI-тесты — «Проверить = сохранить в историю» + вкладки.** «Проверить» теперь сам сохраняет прохождение (ответы+результат) в «Мои тесты» (один раз, фоном) — отдельной кнопки «Сохранить результат» нет. У **учителя** «Мои тесты» = **2 вкладки**: «Пройденные» (что прошёл) и «Сохранённые» (библиотека для ДЗ). У **ученика** — одна история его прохождений. Признак `taken` (пройден vs библиотека) считается в `list`-контроллере (score/непустые answers), без миграции. Учитель: «Сохранить тест» = библиотека, «Проверить» = пройденный. (на ветке `dev`) |
| 2026-07-07 | **AI-тесты — роли (Фаза B2) + помощь (Фаза C) + фикс сохранения.** Фикс: у учителя вернул **«Сохранить тест»** (библиотека, без прохождения) — было ошибочно привязано к «Проверить». AI-тесты открыты **обеим ролям**: учитель — «Сохранить тест» (библиотека), ученик — «Сохранить результат» (прохождение → своя история). Раздел «Инструменты» (AI-тесты, Мои тесты) добавлен и ученику; пустые состояния «Мои тесты» — подсказки по роли (что можно делать). В `/help` — секция **«AI-тесты»** для обеих ролей + кнопка «?» на странице ведёт в неё (`helpSection`). Бэк: сняты `isTeacher` с `/ai/quiz` и `/quizzes` (владелец = текущий пользователь). Прикрепление к ДЗ + прохождение учеником в ДЗ — Фаза B1 (следующая). (на ветке `dev`) |
| 2026-07-07 | **AI-тесты — Фаза A (сохранение РЕЗУЛЬТАТА + история + прохождение).** Интерактивный тест (`QuizRunner`): выбираешь ответы → «Проверить» → результат N/всего + подсветка, «Показать ключ», «Копировать». **«Сохранить результат»** (после проверки) пишет в БД **ответы+счёт**, не пустой тест. **«Мои тесты»** (`/quizzes`) показывает счёт (score/total); открытие `/quizzes/:id` — завершённый тест с твоими ответами (не с нуля), «Пройти заново» — локальный ретейк. Бэк: `Quiz` (JSONB `questions`+`answers`+`score`/`total`) + CRUD `/quizzes` + миграции `20260707000003/004`. Назначение ученикам — Фаза B. (на ветке `dev`) |
| 2026-07-07 | **PWA (установка на телефон + оффлайн-оболочка).** Без внешних зависимостей: `public/manifest.webmanifest` (name/иконки/theme #2563eb/standalone/start_url `/dashboard`), `public/icon.svg` (maskable, буква L), `public/sw.js` — service worker: навигация network-first (свежий HTML после деплоя), статик same-origin cache-first, API и чужие домены не трогает. Регистрация в `main.jsx` **только в PROD** (в dev SW снимается, чтобы не ломать HMR). `index.html` — manifest + theme-color + apple-touch-icon + apple-mobile-web-app-*. Тест: `npm run preview` (localhost = secure context → устанавливается). (на ветке `dev`) |
| 2026-07-07 | **Тарифы учителя (SaaS-подписка), UI.** Новая страница `/plans` (`PlansPage.jsx`): 3 тарифа **Free / Pro (49 zł/мес) / School (скоро)** карточками — цена, что даёт (✓/—, «скоро»-пилюли), текущий выделен («Ваш тариф»), «Улучшить» → тост «оплата подписки скоро» (подключим к шлюзу). Бейдж тарифа в сайдбаре теперь **читает реальный `user.plan`** (был захардкожен «Free») и ведёт на `/plans` (у учителя). Лимиты Free пока **не блокируются**, только показываются. Бэк: поле `User.plan` (free/pro/school) в `/auth/me` и `userResponse`. Реальная оплата подписки — с платёжным шлюзом (отложено). (на ветке `dev`) |
| 2026-07-06 | **Финансы — раздел 3 (шаг 2): страница онлайн-оплаты (UI).** Новый роут `/pay/:teacherId` (только ученик, `PayPage.jsx`): выбор способа (Карта/BLIK/Перевод) с формами, сводка начислено/оплачено/остаток, редактируемая сумма (плейсхолдер = остаток), кнопка «Оплатить N zł», плашки «безопасный платёж»/«деньги напрямую преподавателю». **Демо-режим** — реального списания и записи оплаты нет (не выдумываем деньги), это UI-каркас под Stripe Connect/BLIK + webhook (`source='online'`) — следующий заход. Кнопка «Оплатить» у ученика в «Финансах» теперь ведёт на `/pay/:teacherId` (была заглушка-тост). |
| 2026-07-06 | **Финансы — раздел 3 (шаг 1):** страница оплат получила вкладки **Долги / История оплат**. В модалку внесения оплаты добавлен **выбор способа** (Наличные/Карта/Перевод). Вкладка **История** — **карточки-счета по способам** (Наличные/Карта/Перевод/Онлайн: сколько поступило; клик по карточке фильтрует список «когда»), фильтр по датам (с/по), «Всего получено», список оплат (ученик, дата, бейдж способа, сумма). API: `recordPayment(studentId, amount, method)`, `getPaymentHistory({from,to})` (фильтр по способу — на клиенте). **Фиксы после ревью:** онбординг-чеклист прячется, когда есть и группа, и ученик (не висит на непустом кабинете); тур — тултип у кнопки «?» позиционируется по реальной высоте (не съезжает за экран, кнопки видны). (на ветке `dev`) |
| 2026-07-06 | **UX-раздел 2:** (1) **Онбординг-чеклист** «Быстрый старт» на дашборде учителя — 3 шага (создать группу → добавить ученика → задать ДЗ), галочки по реальным данным, прогресс-бар, кнопка «Сделать» ведёт в раздел; после прохождения/«Скрыть» скрывается навсегда (флаг `lf_onboarding_done`, данные больше не грузятся). (2) **Интерактивный тур** (`components/tour/Tour.jsx`, без зависимостей) — спотлайт-подсветка реальных элементов (`data-tour`: quickstart/kpi/nav/create/help) + тултип «Далее/Назад/Пропустить», Escape-выход; авто-старт один раз для новичка-учителя на дашборде (`lf_tour_done`), повтор — кнопка «Пройти тур» на `/help` (событие `lf:tour-start`). (3) **Скелетоны** на дашборде (`SkeletonDashboard`) и в журнале посещаемости (`SkeletonList`) вместо спиннера. (на ветке `dev`) |
| 2026-07-05 | **Восстановление пароля (фронт):** страницы `/forgot-password` (ввод email) и `/reset-password` (новый пароль по `?token=`), ссылка «Забыли пароль?» на входе, API `forgotPassword`/`resetPassword`. (на ветке `dev`) |
| 2026-07-04 | **Полный светлый SaaS-редизайн приложения.** Все внутренние страницы переведены с тёмной темы на светлую (синий акцент `blue-600`, иконки `lucide-react`, семантические цвета). Лендинг — отдельный тёмный тех-моно стиль (Factory-вайб). Глобальное центрирование контента (`AppLayout` `max-w-[1320px]`). **Журнал посещаемости** переписан в стиле электронного дневника: сетка ученики×даты уроков, помесячная навигация (автооткрытие на месяце последней отметки), ячейки ✓/Н/жёлтый(pending/спор), клик по дате — «все присутствовали». **Инд.уроки** — страница создания разового урока (+ «+ Урок» на странице курса). **Дашборд** — аналитика с разбивкой прибыли (оплачено/долг/потенциал по бакетам). Топбар: рабочие поиск + уведомления. Отдельные страницы `/login` `/register` (модалка убрана). `useFetch` — guard от setState после размонтирования. **Sentry** (`@sentry/react`) + связка с `ErrorBoundary`. `.env`→`.gitignore` + `.env.example`. |
| 2026-07-02 | **Деплой:** `main` был стартовым Vite-scaffold — весь код жил на feat-ветке. Реальное приложение выведено в `main` (Vercel деплоит `main`). Ветки: `main`=прод (авто-деплой), `dev`=работа. |
| 2026-05-19 | UI-компоненты: Button, Input, Modal, Logo, Spinner, EmptyState |
| 2026-05-19 | AuthModal, TeacherLoginPage, WelcomePage, лендинг (6 секций) |
| 2026-05-20 | AppLayout + Sidebar + RoleRoute |
| 2026-05-20 | GroupsPage, GroupDetailPage, HomeworkPage, AttendancePage, PaymentsPage, StudentsPage, CalendarPage |
| 2026-05-20 | 401 → CustomEvent → AuthContext.logout() |
| 2026-05-20 | Полное ревью: обнаружены проблемы (см. REVIEW.md) |
| 2026-06-17 | **Sprint D фронт:** UserProfilePage `/@:username`, RequestModal, follow, StudentsPage вкладки, Sidebar бейдж, точки входа на профиль |
| 2026-06-17 | **Ревью-4 фиксы:** Calendar infinite-loop (гард по диапазону + статич. пропсы), follow-гонка (busy-флаг), viewerContext параллелизация. Детали — REVIEW.md «Ревью 4» |
| 2026-06-22 | **Оплаты:** `PaymentsPage` переписан под live-долг (студент — долг по учителям + заглушка «Оплатить»; учитель — долг по ученикам + модалка «Внести оплату»). `payments.api`: getDebt/getDebtsForTeacher/recordPayment; старые getPayments/calculate/update удалены |
| 2026-06-23 | **Sprint E §2.6.1 — каталог:** `TeachersPage` (`/teachers`) — чипы языков, поиск, сетка карточек → `/@username`; `api/teachers.api`; пункт «Найти учителя» в Sidebar. 🐞 **Фикс роутера:** `/@:username` не матчился в RR7 → роут `/:username` + срез `@` в `UserProfilePage` (чинит весь профильный флоу Sprint D) |
| 2026-06-24 | **Sprint E §2.6.2 — лента (фронт, `vite build` ✅):** `api/posts.api.js`; `FeedPage` (`/feed`, пункт Sidebar в «Главное» обеих ролей, cursor-подгрузка «Загрузить ещё»); `PostComposer` (текст + до 10 фото через `uploadToCloudinary`, превью+удаление); `PostCard` (лайк оптимистично с busy-гардом, просмотры, галерея фото, удаление своего через `ConfirmDialog`); таб «Посты» в `UserProfilePage` (заглушка «Публикации» убрана). Курсор от бэка непрозрачен — офсетное ранжирование на сервере фронт не задело. |
| 2026-06-26 | **C2 Ф3+Ф6 — UI заглушек + перенос (фронт):** `groups.api.addPlaceholder`, `students.api.mergeStudent`/`deletePlaceholder`. В `GroupDetailPage`/`StudentsTab` — «+ Заглушка» + `AddPlaceholderModal`, бейдж «заглушка», contact вместо email, кнопка «Перенести» → `MergeModal` (пикер реальных учеников группы), удаление заглушки = полное (с предупреждением). Реального ученика — отвязка из группы (как раньше). `vite build` ✅. **Браузер-прогон (Playwright/Edge):** add заглушки→бейдж→merge-модалка(только реальные)→delete→0, ноль ошибок консоли. **C2 закрыт.** |
| 2026-06-24 | **Разворот в teacher-first ([REVISION.md](../../REVISION.md)):** соц-слой выносится в отдельный сервис. **Снесён весь соц-UI с фронта:** лента (`pages/feed/*`, `api/posts.api.js`, `/feed`, таб «Посты»), каталог учителей (`pages/teachers/*`, `api/teachers.api.js`, `/teachers`), публичный профиль (`UserProfilePage`, роут `/:username`, `getPublicProfile`), follow (`api/follow.api.js`), заявки (`api/lessonRequests.api.js`, `RequestModal`, таб «Заявки», бейдж Sidebar). Хвосты: `GroupDetailPage` (ученик не кликабелен), `StudentsPage` (упрощён до списка), `ProfilePage` (подсказка username). Бэк **оставлен** (паркуется для будущего соц-сервиса). `vite build` ✅ 737 модулей. |
| 2026-06-28 | **Разворот teacher-first — закоммичен (был незакоммичен с разворота 2026-06-24).** Коммит `651cf12` собрал весь незакоммиченный пласт фронта: удаление соц-UI + C1/C2 (заглушки/merge в `GroupDetailPage`, `StudentsPage` на «моих учеников»). Соц-удаление и C1/C2 переплетены в `StudentsPage` (вкладка «Заявки» ушла вместе с переходом на `getMyStudents`) — поэтому один «разворот»-коммит, а не отдельные. |
| 2026-07-01 | **Безопасность (фронт).** **H4 refresh:** `client.js` — `withCredentials`; на 401 один общий `/auth/refresh` (обновляет access в localStorage) → повтор запроса; не вышло → `auth:logout`. `authStore.logout` зовёт `logoutServer()` (гасит cookie). **H1:** `InviteModal` — поиск по похожим (список результатов, «Пригласить»/«Добавить» на каждом); пикер инд.курсов и списки — без email (бэк убрал PII). `vite build` ✅. |
| 2026-06-28 | **`chatLink` — ссылка на чат группы (фронт).** Поле «Ссылка группового чата» в создании (`GroupsPage`/`CreateGroupModal`) и настройках (`GroupDetailPage`/`SettingsTab`) группы. Отображение «и там, и там»: кнопка «💬 Чат группы» в шапке страницы группы (обе роли) + в карточке урока (`LessonModal` в `GroupDetailPage` и `LessonDetail` в `CalendarPage`, из `lesson.Group.chatLink`). `api/groups.api` не менялся (body целиком). `vite build` ✅. |
| 2026-06-28 | **C3 — приглашения в группу (фронт, механика B; коммит `7686a90`, `vite build` ✅; REVISION.md §5.3 Ф5–Ф6).** `api/invitations.api.js`: `searchStudent`/`inviteToGroup`/`getInvitations`/`respondInvitation`. **Учитель** (`GroupDetailPage`/`StudentsTab`): кнопка «+ Пригласить» + `InviteModal` — поиск студента по точному нику, карточка результата, ветка «ваш ученик» (бейдж) → прямое добавление в группу, иначе отправка приглашения (тосты sonner). **Ученик** (`GroupsPage`): блок «Приглашения в группы (N)» сверху — карточки группа/учитель + «Принять»/«Отклонить»; после accept список групп обновляется (`reload`). Проверка: `vite build` ✅ + API-e2e 8/8 под demo-аккаунтами (логин→поиск→приглашение→accept→членство). Браузер-прогон глазами — отложен (нет Playwright-MCP в сессии). |
| 2026-05-20 | Закрыты все критические и важные задачи (см. REVIEW.md → ИТОГ) |
| 2026-05-20 | ProfilePage (имя+пароль), IndividualLessonsPage, IndividualCoursesPage — заглушки, чтобы Sidebar-ссылки не выкидывали на лендинг |
| 2026-05-20 | Лендинг auth-aware: Header/Hero/About/Footer показывают «В кабинет» если залогинен |
| 2026-05-21 | AttendancePage полная переработка: выбор группы → урока → галочки, key-remount, тосты вместо локальных setError. Студент видит карточки с привязанным ДЗ |
| 2026-05-21 | **ErrorBoundary** + **sonner Toaster** глобально. Axios interceptor показывает toast на 5xx/network |
| 2026-05-21 | **IndividualCoursesPage** переписан с CRUD + создан **IndividualCourseDetailPage** + `individualCourses.api.js`. Закрыт пункт #18 из CLAUDE.md |
| 2026-05-27 | **Sprint C:** ProfilePage полный редизайн (Instagram-style). recharts установлен. 5 UI компонентов (Tabs/AvatarUpload/CoverUpload/LanguagesEditor/SocialsEditor) + 2 chart компонента (TeacherCharts/StudentCharts) + constants/languages.js. api/profile.api.js + api/analytics.api.js. ProfilePage: cover+avatar поверх обложки, статы, прогресс-бар, табы Профиль/Аналитика/Безопасность, sticky кнопка Сохранить, dirty-tracking через JSON-сравнение. |
| 2026-05-27 | **Fix:** recharts@3.8.1 → recharts@2.15.4 (3.x несовместим с Vite 8 pre-bundling: `require_isUnsafeProperty is not a function`). API идентичен — код графиков не правился. Charts вынесены в lazy chunks: TeacherCharts/StudentCharts грузятся только при открытии таба «Аналитика». |
| 2026-05-27 | **Fix:** CORS на бэке расширен — в dev принимает любой `localhost:*` (Vite автоматически переходит на 5174 если 5173 занят); production остаётся строгим по `CLIENT_URL`. |
