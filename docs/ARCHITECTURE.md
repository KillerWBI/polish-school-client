# Frontend — Архитектура

**Обновлено 2026-07-14.**

## Стек

| Слой | Технология |
|------|-----------|
| Build | Vite 8 |
| UI | React 19 |
| Routing | React Router 7 |
| HTTP | Axios (interceptors: JWT + 401-refresh + 5xx toast) |
| Style | TailwindCSS 4 |
| i18n | i18next + react-i18next + browser-languagedetector (7 языков; ru/en/pl/uk полные) |
| Тосты | sonner |
| Анимация | GSAP (лендинг + onboarding) |
| Графики | Recharts 2.15 (lazy) |
| Файлы | Cloudinary (прямая загрузка с фронта) |
| Мониторинг | @sentry/react (off без DSN) |
| PWA | Vite PWA plugin + install button в Sidebar |
| Хостинг | Vercel (main = прод) |

## Локализация (`src/i18n/`)

`index.js` (init i18next, resources, namespaces `common/landing/app/teacher`), `detectLocale.js` (гео по IP `ipwho.is` + кэш), `countryToLang.js` (карта страна→язык), `locales/<lang>/*.json`. Компоненты: `const { t } = useTranslation('<ns>')`. Язык: `localStorage.lf_lang` → гео-IP → navigator → `en`. Переключатель: `components/ui/LanguageSwitcher.jsx`.

---

## Структура файлов

```
src/
├── main.jsx                       # createRoot → <AuthProvider> → <App />
├── App.jsx                        # BrowserRouter + Routes (25+ маршрутов)
├── index.css                      # @import "tailwindcss"; светлая SaaS-палитра
│
├── api/
│   ├── client.js                  # axios: baseURL + Bearer; 401 → refresh → повтор → auth:logout; 5xx toast
│   ├── auth.api.js                # login, register, registerTeacher, fetchMe, changePassword,
│   │                              #   verifyEmail, resendVerification, forgotPassword, resetPassword, refresh, logout
│   ├── groups.api.js              # CRUD + addStudent + addPlaceholder + removeStudent + generateLessons
│   │                              #   + inviteStudent + searchUsers
│   ├── lessons.api.js             # CRUD + params (groupId, from, to, date)
│   ├── students.api.js            # getMyStudents + mergeStudent + deletePlaceholder
│   ├── homework.api.js            # getHomework, createHomework, deleteHomework, submitHomework,
│   │                              #   getSubmissions, gradeSubmission
│   ├── attendance.api.js          # getAttendance, saveAttendance, updateAttendance,
│   │                              #   confirmAttendance, disputeAttendance, resolveDispute
│   ├── payments.api.js            # getDebts (teacher), getDebt (student), recordPayment, getPaymentHistory
│   ├── individualCourses.api.js   # CRUD + generateLessons
│   ├── individualLessons.api.js   # getIndividualLessons, getIndividualLesson
│   ├── invitations.api.js         # getInvitations, respondInvitation (C3)
│   ├── analytics.api.js           # getTeacherAnalytics, getStudentAnalytics
│   └── admin.api.js               # getStats, getTeachers, getUsers, deactivate, activate, setRole, setPlan
│
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx          # модалка Вход/Регистрация; success-анимация
│   ├── layout/
│   │   ├── AppLayout.jsx          # Sidebar + <Outlet> + EmailVerificationBanner
│   │   ├── Sidebar.jsx            # premium: секции Главное/Учёба/Финансы; профиль+badge вверху;
│   │   │                          #   «!» если нет реквизитов; PWA-кнопка; «Администрирование» для admin
│   │   ├── PrivateRoute.jsx       # редирект → / если нет токена
│   │   ├── RoleRoute.jsx          # редирект если роль не совпадает
│   │   └── EmailVerificationBanner.jsx  # баннер «Подтвердите email» (sticky top)
│   ├── QuizGenerator.jsx          # AI-генерация тестов (Groq через бэкенд)
│   └── ui/
│       ├── Button.jsx             # primary/secondary/ghost/danger; sm/md/lg; loading; type="button" по умолчанию
│       ├── Input.jsx              # floating label, светлая тема, error state
│       ├── PageContainer.jsx      # единый контейнер страницы: mx-auto + ширина (wide 1240 / form / narrow) — контент не прижат влево
│       ├── Modal.jsx              # portal, Esc, overlay click, крестик (×, showClose) — закрытие на телефоне без Esc
│       ├── ConfirmDialog.jsx      # диалог подтверждения деструктивных действий
│       ├── Logo.jsx               # GSAP-анимация
│       ├── Spinner.jsx            # + PageSpinner
│       ├── EmptyState.jsx         # заглушка-плейсхолдер
│       └── ErrorBoundary.jsx      # глобальный перехват ошибок рендера
│
├── hooks/
│   ├── useAuth.js                 # { user, isTeacher, isStudent, isAdmin, isAuthenticated }
│   └── useFetch.js                # async data fetching с reload(); fn должна быть стабильной ссылкой
│
├── pages/
│   ├── auth/
│   │   ├── TeacherLoginPage.jsx   # тёмный вход учителя, canvas-частицы, success-экран
│   │   ├── VerifyEmailPage.jsx    # подтверждение email по токену из письма
│   │   ├── ForgotPasswordPage.jsx # запрос сброса пароля
│   │   └── ResetPasswordPage.jsx  # новый пароль по токену
│   ├── admin/
│   │   └── AdminPage.jsx          # Stats + Teachers + Users (dropdown с portal, смена роли/тарифа/активности)
│   ├── attendance/
│   │   └── AttendancePage.jsx     # 3 вкладки: Журнал / Ожидают(N) / Спорные(N) — dual-confirmation
│   ├── calendar/
│   │   └── CalendarPage.jsx       # FullCalendar daygrid с ru locale + chatLink/lessonLink в модалке
│   ├── dashboard/
│   │   └── DashboardPage.jsx      # Variant C Premium (KPI + Сегодня + Предстоящие + Activity + Создать)
│   ├── groups/
│   │   ├── GroupsPage.jsx         # список + создание; блок приглашений у студента (C3)
│   │   └── GroupDetailPage.jsx    # вкладки: Студенты(+InviteModal) / Уроки / Настройки
│   ├── help/
│   │   └── HelpPage.jsx           # FAQ-справка (группы/уроки/ДЗ/посещаемость/финансы/звонки/тарифы/PWA)
│   ├── homework/
│   │   └── HomeworkPage.jsx       # + QuizGenerator; студент: StudentHWCard (submit файл/коммент)
│   ├── individual-courses/
│   │   └── IndividualCoursesPage.jsx  # CRUD + generate lessons
│   ├── individual-lessons/
│   │   └── IndividualLessonsPage.jsx  # read-only список
│   ├── landing/
│   │   ├── LandingPage.jsx        # компоновщик секций (тёмный лендинг)
│   │   └── sections/              # Header, Hero, Features, About, Faq, Footer
│   ├── pay/
│   │   └── PayPage.jsx            # /pay/:teacherId — реквизиты учителя + скриншот → PaymentRecord
│   ├── payments/
│   │   └── PaymentsPage.jsx       # live-debt модель (долг / внести / история)
│   ├── profile/
│   │   └── ProfilePage.jsx        # Instagram-style (обложка+аватар, табы: Профиль/Аналитика/Безопасность)
│   ├── settings/
│   │   └── SettingsPage.jsx       # /settings: Личные данные + Способы оплаты (учитель)
│   ├── students/
│   │   └── StudentsPage.jsx       # таблица с поиском + merge заглушки
│   └── welcome/
│       └── WelcomePage.jsx        # onboarding-экран после входа
│
├── store/
│   └── authStore.jsx              # AuthContext: user, loading, login(), logout() + auth:logout listener
│
└── utils/
    ├── token.js                   # getToken / setToken / removeToken (localStorage)
    ├── formatDate.js              # утилиты форматирования дат
    └── uploadToCloudinary.js      # Cloudinary direct upload helper
```

---

## Поток данных

```
Пользователь → Page-компонент
    │
    ▼
src/api/*.api.js (функция запроса)
    │
    ▼
src/api/client.js (axios instance)
    ├── request interceptor: Authorization: Bearer <token>
    ├── response interceptor: 401 → refresh → повтор; провал → auth:logout
    │                         5xx/network → sonner toast
    │
    ▼
Backend API (VITE_API_URL/api/v1/...)
    │
    ▼
{ data } / { error } → локальный useState страницы
```

---

## Роутинг

| Путь | Компонент | Роль |
|------|-----------|------|
| `/` | LandingPage | публичный |
| `/teacher-login` | TeacherLoginPage | публичный |
| `/forgot-password` | ForgotPasswordPage | публичный |
| `/reset-password` | ResetPasswordPage | публичный |
| `/verify-email` | VerifyEmailPage | публичный |
| `/welcome` | WelcomePage | any |
| `/dashboard` | DashboardPage | any |
| `/calendar` | CalendarPage | any |
| `/groups` | GroupsPage | teacher |
| `/groups/:id` | GroupDetailPage | teacher |
| `/homework` | HomeworkPage | any |
| `/attendance` | AttendancePage | any |
| `/payments` | PaymentsPage | any |
| `/pay/:teacherId` | PayPage | student |
| `/students` | StudentsPage | teacher |
| `/individual-courses` | IndividualCoursesPage | teacher |
| `/individual-lessons` | IndividualLessonsPage | any |
| `/profile` | ProfilePage | any |
| `/settings` | SettingsPage | any |
| `/help` | HelpPage | any |
| `/admin` | AdminPage | admin |
| `*` | redirect → `/` | — |

---

## Цветовая палитра

**Приложение (кабинет)** — светлый SaaS, синий акцент:
- Фон: `white / slate-50`
- Акцент: `blue-600`
- Иконки: lucide-react

**Лендинг** — тёмный технологичный моно:
- Фон: `#0F1629` / `#080B14` (TeacherLoginPage)
- Акцент: фиолетовый `#8B5CF6`
- Анимации: GSAP

---

## Axios Client — refresh flow

```js
// При 401:
// 1. Пытаемся POST /auth/refresh (httpOnly cookie)
// 2. Если успех — сохраняем новый access-токен, повторяем оригинальный запрос
// 3. Если ошибка — removeToken() + auth:logout event → logout
```

---

## Правила кода

- Компоненты — функциональные, без классов
- Запросы — только через `src/api/`, не inline в компонентах
- Токен — только через `src/utils/token.js`
- Стили — Tailwind; inline только для динамических значений (GSAP, порталы)
- Комментарии — на русском
