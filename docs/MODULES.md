# Frontend — Модули

**Обновлено 2026-07-09.** Каждый модуль = api-функции + страница(ы) + UI.

---

## 1. Auth ✅

- `src/api/auth.api.js` — `login`, `register`, `registerTeacher`, `fetchMe`, `changePassword`, `verifyEmail`, `resendVerification`, `forgotPassword`, `resetPassword`, `refresh`, `logout`
- `src/store/authStore.jsx` — AuthContext: `{ user, loading, login(), logout() }` + слушает `auth:logout` event
- `src/utils/token.js` — `getToken / setToken / removeToken` (localStorage)
- `src/hooks/useAuth.js` — `{ user, isTeacher, isStudent, isAdmin, isAuthenticated }`
- `src/api/client.js` — JWT interceptor + 401→`auth:logout` event + 5xx/network toast через sonner
- `src/components/layout/PrivateRoute.jsx` — редирект → `/` если нет токена
- `src/components/layout/RoleRoute.jsx` — редирект если не та роль
- `src/components/layout/EmailVerificationBanner.jsx` — баннер «Подтвердите email» если `user.emailVerified=false`
- `src/pages/auth/VerifyEmailPage.jsx` — страница `/verify-email?token=` (подтверждение по ссылке из письма)
- `src/pages/auth/ForgotPasswordPage.jsx` — запрос сброса пароля
- `src/pages/auth/ResetPasswordPage.jsx` — новый пароль по токену из письма

---

## 2. Layout кабинета ✅

- `src/components/layout/AppLayout.jsx` — Sidebar + `<Outlet>` + `EmailVerificationBanner`
- `src/components/layout/Sidebar.jsx` — **premium**: секции «Главное / Учёба / Финансы», профиль и тариф-badge вверху, кликабельный логотип → `/dashboard`, «!»-индикатор если не заполнены реквизиты оплаты, PWA-кнопка «Установить», «Администрирование» для admin

---

## 3. Dashboard ✅

- `src/pages/dashboard/DashboardPage.jsx` — **Variant C Premium** для обеих ролей

**Учитель:** KPI-плашки (студенты, уроки на неделе, долг, посещаемость%), блок «Сегодня» (уроки дня), блок «Предстоящие», лента «Activity Feed» (последние события), dropdown «+ Создать» (группа/урок/ДЗ).

**Студент:** KPI-плашки (уроков на неделе, ДЗ к сдаче, посещаемость, долг), список ДЗ с дедлайнами + `lessonLink`-кнопки, лента оценок.

---

## 4. Groups ✅

- `src/api/groups.api.js` — `getGroups`, `getGroup`, `createGroup`, `updateGroup`, `deleteGroup`, `addStudent`, `removeStudent`, `generateLessons`, `createPlaceholder`, `inviteStudent`, `searchUsers`
- `src/pages/groups/GroupsPage.jsx` — список карточек + создание; у студента — блок входящих приглашений (C3) с «Принять»/«Отклонить»
- `src/pages/groups/GroupDetailPage.jsx` — 3 вкладки: **Студенты** (реальный / заглушка / пригласить по нику / перенести / убрать), **Уроки** (список + генерация + создание/просмотр урока), **Настройки** (редактировать `name/schedule/pricePerLesson/chatLink/lessonLink` + удалить)

**`chatLink`:** поле в настройках группы; при наличии — кнопка «💬 Чат группы» в шапке группы и карточке урока.

**InviteModal (C3):** iLike-поиск по нику/имени → список учеников → «Пригласить» (создаёт `Invitation{pending}`) или «Добавить» если уже ваш → прямое членство.

---

## 5. Homework 🔶

- `src/api/homework.api.js` — `getHomework`, `createHomework`, `deleteHomework`, `submitHomework`, `getSubmissions`, `gradeSubmission`
- `src/pages/homework/HomeworkPage.jsx` — учитель: создание/просмотр/удаление ДЗ, модалка сдач (`SubmissionsModal`, показывает имя), выставление/правка оценки; студент: список ДЗ со статусами (Не сдано / Просрочено / На проверке / Оценено) + `StudentHWCard` — сдача файлом (Cloudinary) + комментарий (файл необязателен)
- `src/components/QuizGenerator.jsx` — AI-генерация тестов (Groq API через бэкенд), привязка к ДЗ

**Нет:** ownership check на edit/delete (бэкенд)

---

## 6. Attendance ✅

- `src/api/attendance.api.js` — `getAttendance`, `saveAttendance`, `updateAttendance`, `confirmAttendance`, `disputeAttendance`, `resolveDispute`
- `src/pages/attendance/AttendancePage.jsx` — **dual-confirmation, 3 вкладки:**
  - **Журнал** — сетка ученики×даты (электронный дневник); учитель отмечает / редактирует; студент видит свою историю
  - **Ожидают (N)** — студент подтверждает/оспаривает записи посещаемости
  - **Спорные (N)** — учитель разрешает споры (accept/reject)

---

## 7. Payments ✅

- `src/api/payments.api.js` — `getDebts` (учитель: долг по ученикам), `getDebt` (студент: долг по учителям), `recordPayment`, `getPaymentHistory`
- `src/pages/payments/PaymentsPage.jsx` — **live-debt модель:** учитель видит таблицу долгов по ученикам + кнопка «Внести оплату» (сумма + метод) + `ConfirmDialog`; студент видит долг по каждому учителю + ссылка «Оплатить» → `/pay/:teacherId`
- `src/pages/pay/PayPage.jsx` — `/pay/:teacherId` — страница оплаты для студента: реквизиты учителя (IBAN/BLIK/PayPal/Revolut/custom) + загрузка скриншота → `POST /payments/record{source:'student'}`

---

## 8. Settings ✅ (2026-07-09, заменил /profile как страницу редактирования)

- `src/pages/settings/SettingsPage.jsx` — `/settings`: 2 вкладки
  - **Личные данные** — имя, username, bio, аватар, языки, соцсети (TG/WA/LinkedIn), смена пароля
  - **Способы оплаты** — для учителей: поля IBAN/BLIK/PayPal/Revolut/custom-label + своё поле; `PATCH /users/:id/payment-details` → `paymentDetails` JSONB

Баннер «Заполните реквизиты оплаты» в сайдбаре пока `paymentDetails` пуст.

---

## 9. Students ✅

- `src/api/students.api.js` — `getStudents`, `getStudent`, `mergeStudent`
- `src/pages/students/StudentsPage.jsx` — таблица студентов с поиском по имени; заглушки помечены (нет аккаунта); кнопка «Перенести» (merge на реального)

---

## 10. Calendar ✅

- `src/pages/calendar/CalendarPage.jsx` — FullCalendar daygrid с **ru locale**; загружает групповые + индивидуальные уроки; клик → модалка с деталями + `lessonLink`-кнопка + `chatLink`-кнопка

---

## 11. Individual Courses ✅

- `src/api/individualCourses.api.js` — полный CRUD + `generateLessons`
- `src/pages/individual-courses/IndividualCoursesPage.jsx` — список курсов + создание/редактирование/удаление + генерация уроков по расписанию

---

## 12. Individual Lessons 🔶 (read-only)

- `src/api/individualLessons.api.js` — `getIndividualLessons`, `getIndividualLesson`
- `src/pages/individual-lessons/IndividualLessonsPage.jsx` — список уроков с фильтром; используется в Calendar

**Нет:** создание/редактирование/удаление уроков через эту страницу (только через Calendar или GroupDetail)

---

## 13. Profile ✅ (analytics + public view)

- `src/pages/profile/ProfilePage.jsx` — Instagram-style: обложка + аватар (Cloudinary), bio, соцсети, языки, прогресс-бар заполнения, табы «Профиль» / «Аналитика» / «Безопасность»

**Аналитика учителя (Recharts, lazy):** Line paid+charged (фильтр day/week/month) + Area студенты + плашка attendance.

**Аналитика студента (Recharts, lazy):** Area посещаемость + Line оценки + progress-bar ДЗ.

---

## 14. Admin ✅ (2026-07-09)

- `src/pages/admin/AdminPage.jsx` — `/admin`, доступна только `role=admin` через `RoleRoute`
- **Stats:** KPI-плашки (учителя/студенты/группы/уроки/выручка)
- **Teachers:** пагинированный список с тарифом и статусом
- **Users:** таблица всех пользователей с фильтром; dropdown «Действия ▾» (createPortal, позиционируется абсолютно от кнопки — не уходит под контейнер): смена роли, смена тарифа, деактивировать/восстановить

---

## 15. Help ✅

- `src/pages/help/HelpPage.jsx` — справка для пользователей: FAQ по группам/урокам/ДЗ/посещаемости/финансам/видеозвонкам/тарифам/PWA

---

## UI-компоненты ✅

| Компонент | Статус |
|-----------|--------|
| `Button.jsx` | ✅ primary/secondary/ghost/danger; sm/md/lg; loading; default type="button" |
| `Input.jsx` | ✅ floating label, светлая тема, error state |
| `Modal.jsx` | ✅ portal, Esc, overlay click |
| `ConfirmDialog.jsx` | ✅ диалог подтверждения деструктивных действий |
| `Logo.jsx` | ✅ GSAP анимация |
| `Spinner.jsx` + `PageSpinner` | ✅ |
| `EmptyState.jsx` | ✅ |
| `AuthModal.jsx` | ✅ |
| `ErrorBoundary.jsx` | ✅ глобальный перехват ошибок рендера |
