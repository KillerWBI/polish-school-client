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

### ❌ Остаётся
- [ ] `IndividualLessonsPage` — расширить (сейчас read-only): редактирование, удаление, фильтры
- [ ] `StudentsPage` — клик → профиль студента + пагинация
- [ ] `PaymentsPage` — серверная фильтрация по month вместо клиентской
- [ ] **TanStack Query** вместо `useFetch` (кэш, optimistic updates, retry, dedupe)
- [ ] `httpOnly` cookie для JWT вместо `localStorage` (XSS защита)
- [ ] `confirm()` → `<ConfirmDialog />` компонент (платформенная модалка)
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
| 2026-05-20 | Закрыты все критические и важные задачи (см. REVIEW.md → ИТОГ) |
| 2026-05-20 | ProfilePage (имя+пароль), IndividualLessonsPage, IndividualCoursesPage — заглушки, чтобы Sidebar-ссылки не выкидывали на лендинг |
| 2026-05-20 | Лендинг auth-aware: Header/Hero/About/Footer показывают «В кабинет» если залогинен |
| 2026-05-21 | AttendancePage полная переработка: выбор группы → урока → галочки, key-remount, тосты вместо локальных setError. Студент видит карточки с привязанным ДЗ |
| 2026-05-21 | **ErrorBoundary** + **sonner Toaster** глобально. Axios interceptor показывает toast на 5xx/network |
| 2026-05-21 | **IndividualCoursesPage** переписан с CRUD + создан **IndividualCourseDetailPage** + `individualCourses.api.js`. Закрыт пункт #18 из CLAUDE.md |
