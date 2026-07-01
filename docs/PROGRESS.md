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
| 2026-05-19 | Инфраструктура: Vite+React+Tailwind, token, client, authStore, useAuth, PrivateRoute |
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
