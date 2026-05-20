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
| `individualLessons.api.js` | ✅ | CRUD + params |
| `individualCourses.api.js` | ❌ | не создан |

---

## Страницы

| Страница | Путь | Статус | Проблемы |
|----------|------|--------|---------|
| LandingPage | `/` | ✅ | — |
| TeacherLoginPage | `/teacher-login` | ✅ | — |
| WelcomePage | `/welcome` | ✅ | — |
| CalendarPage | `/calendar` | 🟡 | Нет ru locale FullCalendar; нет обработки ошибки загрузки |
| GroupsPage | `/groups` | 🟡 | Форма не сбрасывается при закрытии с ошибкой |
| GroupDetailPage | `/groups/:id` | 🟡 | Нет ручного создания урока; уроки не кликабельны |
| HomeworkPage (teacher) | `/homework` | 🟡 | UUID вместо имени студента в сдачах; нет инд. уроков |
| HomeworkPage (student) | `/homework` | 🔴 | **Нельзя сдать ДЗ** |
| AttendancePage (teacher) | `/attendance` | 🟡 | State не сбрасывается; нет инд. уроков |
| AttendancePage (student) | `/attendance` | 🟡 | Нет инд. посещений |
| PaymentsPage | `/payments` | 🟡 | Клиентская фильтрация, может не показать все записи |
| StudentsPage | `/students` | 🟡 | Нет клика → профиль; нет пагинации |
| IndividualCoursesPage | `/individual-courses` | ❌ | — |
| IndividualLessonsPage | `/individual-lessons` | ❌ | — |
| ProfilePage | `/profile` | ❌ | — |

---

## Что делать (по приоритету)

### 🔴 Срочно
- [ ] `HomeworkPage` — форма сдачи ДЗ для студента (Cloudinary + `submitHomework`)
- [ ] `HomeworkPage` — имя студента в SubmissionsModal (после фикса бэкенда)

### 🟡 Важно
- [ ] `AttendancePage` — сброс present при смене урока
- [ ] `AttendancePage` — поддержка индивидуальных уроков
- [ ] `GroupDetailPage` — кнопка ручного создания урока
- [ ] `GroupDetailPage` — клик на урок → детали
- [ ] `HomeworkPage` — создание ДЗ для инд. уроков
- [ ] `CalendarPage` — ru locale для FullCalendar
- [ ] `Sidebar` — ссылки на профиль и инд. курсы/уроки

### ❌ Новые страницы
- [ ] `IndividualCoursesPage` + `IndividualCourseDetailPage` + `individualCourses.api.js`
- [ ] `IndividualLessonsPage`
- [ ] `ProfilePage` (имя + смена пароля)

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
