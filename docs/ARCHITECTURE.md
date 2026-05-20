# Frontend — Архитектура

## Текущая структура файлов

```
src/
├── main.jsx                       # createRoot → <AuthProvider> → <App />
├── App.jsx                        # BrowserRouter + Routes (11 маршрутов)
├── index.css                      # @import "tailwindcss"; тёмная палитра #0F1629
│
├── api/
│   ├── client.js                  # axios instance: baseURL, JWT interceptor, 401 → auth:logout event
│   ├── auth.api.js                # login(), register(), fetchMe()
│   ├── groups.api.js              # CRUD + addStudent + removeStudent + generateLessons
│   ├── lessons.api.js             # CRUD + params (groupId, from, to, date)
│   ├── students.api.js            # getStudents, getStudent
│   ├── homework.api.js            # getHomework, createHomework, deleteHomework, getSubmissions, gradeSubmission
│   │                              # ❌ нет: submitHomework
│   ├── attendance.api.js          # getAttendance, saveAttendance, updateAttendance
│   ├── payments.api.js            # getPayments, calculatePayments, updatePayment
│   └── individualLessons.api.js   # CRUD + params
│   # ❌ нет: individualCourses.api.js
│
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx          # модалка Вход/Регистрация (GSAP-индикатор, success-анимация)
│   ├── layout/
│   │   ├── AppLayout.jsx          # Sidebar + <Outlet> — оборачивает все защищённые страницы
│   │   ├── Sidebar.jsx            # навигация по ролям (TEACHER_NAV / STUDENT_NAV)
│   │   │                          # ⚠️ нет: /profile, /individual-courses, /individual-lessons
│   │   ├── PrivateRoute.jsx       # редирект → / если нет токена
│   │   └── RoleRoute.jsx          # редирект если роль не совпадает
│   └── ui/
│       ├── Button.jsx             # primary(river) / secondary(glass) / ghost; sm/md/lg; loading
│       ├── Input.jsx              # floating label, тёмная тема, error state
│       ├── Modal.jsx              # portal, Esc, overlay click, тёмный фон #141D35
│       ├── Logo.jsx               # GSAP-точки + текст Platform
│       ├── Spinner.jsx            # PageSpinner
│       └── EmptyState.jsx         # заглушка-плейсхолдер
│
├── hooks/
│   ├── useAuth.js                 # { user, isTeacher, isStudent, isAuthenticated }
│   └── useFetch.js                # async data fetching с reload(); fn должен быть стабильной ссылкой
│
├── pages/
│   ├── auth/
│   │   └── TeacherLoginPage.jsx   # тёмный вход учителя, canvas-частицы, success-экран
│   ├── calendar/
│   │   └── CalendarPage.jsx       # FullCalendar daygrid (групповые + инд. уроки, клик → модалка)
│   ├── dashboard/
│   │   └── DashboardPage.jsx      # role-aware карточки-навигация (без реальных данных)
│   ├── groups/
│   │   ├── GroupsPage.jsx         # список групп + модалка создания
│   │   └── GroupDetailPage.jsx    # вкладки: Студенты / Уроки / Настройки
│   ├── homework/
│   │   └── HomeworkPage.jsx       # учитель: создание/просмотр/оценка; студент: просмотр (❌ нет submit)
│   ├── attendance/
│   │   └── AttendancePage.jsx     # учитель: отметка (только групповые); студент: история
│   ├── payments/
│   │   └── PaymentsPage.jsx       # расчёт за месяц + отметка оплаты (teacher) + просмотр (student)
│   ├── students/
│   │   └── StudentsPage.jsx       # список студентов с поиском (только teacher)
│   ├── landing/
│   │   ├── LandingPage.jsx        # компоновщик + AuthModal state
│   │   └── sections/              # Header, Hero, Features, About, Faq, Footer
│   └── welcome/
│       └── WelcomePage.jsx        # экран после входа/регистрации
│
├── store/
│   └── authStore.jsx              # AuthContext: user, loading, login(), logout() + auth:logout listener
│
└── utils/
    ├── token.js                   # getToken / setToken / removeToken (localStorage)
    ├── formatDate.js              # утилиты форматирования дат
    └── uploadToCloudinary.js      # Cloudinary upload helper (не подключён к UI)
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
    ├── request interceptor: добавляет Authorization: Bearer <token>
    ├── response interceptor: на 401 → removeToken() + dispatchEvent('auth:logout')
    │
    ▼
Backend API (VITE_API_URL/api/v1/...)
    │
    ▼
{ data } / { error } → локальный useState страницы
```

---

## Роутинг (текущий)

| Путь | Компонент | Тип | Роль |
|------|-----------|-----|------|
| `/` | LandingPage | публичный | — |
| `/teacher-login` | TeacherLoginPage | публичный (скрытый) | — |
| `/welcome` | WelcomePage | PrivateRoute | any |
| `/dashboard` | DashboardPage | PrivateRoute | any |
| `/calendar` | CalendarPage | PrivateRoute | any |
| `/groups` | GroupsPage | PrivateRoute | teacher |
| `/groups/:id` | GroupDetailPage | PrivateRoute | teacher |
| `/homework` | HomeworkPage | PrivateRoute | any |
| `/attendance` | AttendancePage | PrivateRoute | any |
| `/payments` | PaymentsPage | PrivateRoute | any |
| `/students` | StudentsPage | PrivateRoute | teacher |
| `*` | redirect → `/` | — | — |

**Не реализованы:** `/individual-courses`, `/individual-courses/:id`, `/individual-lessons`, `/profile`

---

## Цветовая палитра (тёмная, текущая)

| CSS-переменная | Значение | Использование |
|---------------|----------|---------------|
| `--color-ink` | `#EEF2FF` | Основной текст |
| `--color-ink-soft` | `#C5D0E8` | Вторичный текст |
| `--color-ink-muted` | `#6B7FA3` | Плейсхолдеры, подсказки |
| `--color-brand-600` | `#8B5CF6` | Основной фиолетовый |
| `--color-pink-accent` | `#EC4899` | Розовый акцент |
| `body bg` | `#0F1629` | Фон страниц лендинга |
| `modal bg` | `#141D35` | Фон модалок |
| `teacher-login bg` | `#080B14` | Только TeacherLoginPage |

---

## Анимационная система (GSAP)

| Паттерн | Где используется |
|---------|-----------------|
| `useLayoutEffect + gsap.context + ctx.revert()` | TeacherLoginPage (StrictMode-safe) |
| `gsap.from + immediateRender: false` | Все ScrollTrigger-секции |
| `gsap.to (fade-out) + useEffect([idx]) (fade-in)` | Hero rotating word |
| `gsap.to + scrub: 2` | Hero fog parallax |
| `gsap.fromTo` | Hero entrance, Dashboard cards |
| `btn-river` (CSS @keyframes) | Все primary-кнопки |
| `blob-float-1/2` (CSS @keyframes) | Фоновые блобы |

---

## Правила кода

- Компоненты — функциональные, без классов
- Запросы — только через `src/api/`, не inline в компонентах
- Токен — только через `src/utils/token.js`, никогда `localStorage` напрямую
- Стили — Tailwind utility-классы; inline только для динамических значений (GSAP, градиенты)
- Анимации — GSAP; `useLayoutEffect` для mount-анимаций, `useEffect` для scroll-triggered
- Комментарии — на русском

---

## Axios Client (`src/api/client.js`)

```js
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 15000 })

client.interceptors.request.use((cfg) => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken()
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  }
)
```

---

## Примечание о useFetch

`useFetch(fn, deps)` — хук для стабильного fetch с `reload()`. Функция `fn` должна быть стабильной ссылкой (через `useCallback`) чтобы не вызвать бесконечный re-fetch:

```jsx
// Правильно:
const { data } = useFetch(useCallback(() => getGroup(id), [id]))

// Тоже OK — модульная функция без замыканий стабильна:
const { data } = useFetch(getLessons)
```
