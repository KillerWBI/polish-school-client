# Frontend — Модули

Каждый модуль = api-функции + страница(ы) + UI.

---

## 1. Auth ✅

- `src/api/auth.api.js` — `login()`, `register()`, `fetchMe()`
- `src/store/authStore.jsx` — AuthContext: `{ user, loading, login(), logout() }` + слушает `auth:logout` event
- `src/utils/token.js` — `getToken / setToken / removeToken` (localStorage)
- `src/hooks/useAuth.js` — `{ user, isTeacher, isStudent, isAuthenticated }`
- `src/api/client.js` — JWT interceptor + 401→`auth:logout` event
- `src/components/layout/PrivateRoute.jsx` — редирект → `/` если нет токена
- `src/components/layout/RoleRoute.jsx` — редирект если не та роль

---

## 2. Layout кабинета ✅

- `src/components/layout/AppLayout.jsx` — sidebar + `<Outlet>`
- `src/components/layout/Sidebar.jsx` — навигация по ролям

---

## 3. Groups ✅ (с ограничениями)

- `src/api/groups.api.js` — getGroups, getGroup, createGroup, updateGroup, deleteGroup, addStudent, removeStudent, generateLessons
- `src/pages/groups/GroupsPage.jsx` — список + модалка создания
- `src/pages/groups/GroupDetailPage.jsx` — студенты / уроки / настройки

**Ограничения:**
- Нет ручного создания урока из GroupDetailPage
- Нет перехода к деталям урока по клику

---

## 4. Homework 🔶

- `src/api/homework.api.js` — getHomework, createHomework, deleteHomework, getSubmissions, gradeSubmission
- `src/pages/homework/HomeworkPage.jsx` — создание/просмотр/оценка (teacher) + просмотр (student)

**Не работает:**
- Студент не может сдать ДЗ — нет `submitHomework` в api и нет формы
- `SubmissionsModal` показывает UUID студента вместо имени

---

## 5. Attendance 🔶

- `src/api/attendance.api.js` — getAttendance, saveAttendance, updateAttendance
- `src/pages/attendance/AttendancePage.jsx` — отметка (teacher) + история (student)

**Проблема:**
- `present`-state не сбрасывается при смене урока
- Нет отметки для индивидуальных уроков

---

## 6. Payments ✅

- `src/api/payments.api.js` — getPayments, calculatePayments, updatePayment
- `src/pages/payments/PaymentsPage.jsx` — расчёт + отметка оплаты (teacher) + просмотр (student)

---

## 7. Students ✅

- `src/api/students.api.js` — getStudents, getStudent
- `src/pages/students/StudentsPage.jsx` — список студентов (только teacher)

---

## 8. Calendar 🟡

- `src/pages/calendar/CalendarPage.jsx` — FullCalendar daygrid, API подключена

**Работает:**
- `datesSet` → загрузка уроков при смене месяца ✅
- Групповые уроки (фиолетовые) + индивидуальные уроки (розовые) ✅
- Клик на событие → модалка с деталями урока ✅
- Ссылка "Перейти на урок" если есть `lessonLink` ✅

**Проблемы:**
- Нет импорта ru locale — кнопки "Назад/Вперёд" на английском
- Ошибка загрузки не показывается пользователю (только `console.error`)

---

## 9. Individual Courses ❌

- `src/api/individualCourses.api.js` — не создан
- `src/pages/individual-courses/` — не создан

**API бэкенда готово:** `GET/POST /individual-courses`, `GET/PUT/DELETE /individual-courses/:id`, `POST /individual-courses/:id/generate-lessons`

---

## 10. Individual Lessons ❌

- Страница не создана (api-файл `individualLessons.api.js` есть)

---

## 11. Profile ❌

- `src/pages/profile/ProfilePage.jsx` — не создан
- Нужно: изменение имени (`PUT /users/:id`) + смена пароля (`PUT /auth/password`)

---

## UI-компоненты ✅

| Компонент | Статус |
|-----------|--------|
| `Button.jsx` | ✅ primary/secondary/ghost; sm/md/lg; loading |
| `Input.jsx` | ✅ floating label, тёмная тема, error state |
| `Modal.jsx` | ✅ portal, Esc, overlay click |
| `Logo.jsx` | ✅ GSAP анимация |
| `Spinner.jsx` + `PageSpinner` | ✅ |
| `EmptyState.jsx` | ✅ |
| `AuthModal.jsx` | ✅ |
