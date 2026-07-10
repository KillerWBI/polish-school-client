import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Eager — нужны немедленно (лендинг, auth, layout)
import LandingPage        from './pages/landing/LandingPage'
import StudentLandingPage from './pages/landing/StudentLandingPage'
import AuthPage           from './pages/auth/AuthPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'
import VerifyEmailPage    from './pages/auth/VerifyEmailPage'
import SupportPage        from './pages/support/SupportPage'
import AppLayout          from './components/layout/AppLayout'
import PrivateRoute       from './components/layout/PrivateRoute'
import RoleRoute          from './components/layout/RoleRoute'
import DashboardPage      from './pages/dashboard/DashboardPage'

// Lazy — грузятся только при переходе на страницу (экономит ~300KB+ начального бандла)
const CalendarPage               = lazy(() => import('./pages/calendar/CalendarPage'))
const GroupsPage                 = lazy(() => import('./pages/groups/GroupsPage'))
const GroupDetailPage            = lazy(() => import('./pages/groups/GroupDetailPage'))
const StudentsPage               = lazy(() => import('./pages/students/StudentsPage'))
const HomeworkPage               = lazy(() => import('./pages/homework/HomeworkPage'))
const AttendancePage             = lazy(() => import('./pages/attendance/AttendancePage'))
const PaymentsPage               = lazy(() => import('./pages/payments/PaymentsPage'))
const PayPage                    = lazy(() => import('./pages/payments/PayPage'))
const SettingsPage               = lazy(() => import('./pages/settings/SettingsPage'))
const IndividualCoursesPage      = lazy(() => import('./pages/individual-courses/IndividualCoursesPage'))
const IndividualCourseDetailPage = lazy(() => import('./pages/individual-courses/IndividualCourseDetailPage'))
const IndividualLessonsPage      = lazy(() => import('./pages/individual-lessons/IndividualLessonsPage'))
const HelpPage                   = lazy(() => import('./pages/help/HelpPage'))
const PlansPage                  = lazy(() => import('./pages/plans/PlansPage'))
const QuizGeneratorPage          = lazy(() => import('./pages/quiz/QuizGeneratorPage'))
const MyQuizzesPage              = lazy(() => import('./pages/quiz/MyQuizzesPage'))
const QuizViewPage               = lazy(() => import('./pages/quiz/QuizViewPage'))
const AdminPage                  = lazy(() => import('./pages/admin/AdminPage'))
const VocabPage                  = lazy(() => import('./pages/vocab/VocabPage'))
const MyLessonsPage              = lazy(() => import('./pages/my-lessons/MyLessonsPage'))
const NotesPage                  = lazy(() => import('./pages/notes/NotesPage'))
const ProgressPage               = lazy(() => import('./pages/progress/ProgressPage'))
const MaterialsPage              = lazy(() => import('./pages/materials/MaterialsPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/for-students"   element={<StudentLandingPage />} />
        <Route path="/login"           element={<AuthPage mode="login" />} />
        <Route path="/register"          element={<AuthPage mode="register" role="teacher" />} />
        <Route path="/register-student"  element={<AuthPage mode="register" role="student" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/verify-email"    element={<VerifyEmailPage />} />
        <Route path="/support"         element={<SupportPage />} />

        {/* Кабинет — Suspense внутри AppLayout вокруг <Outlet /> */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>

          {/* Общие — оба роля видят (внутри страница отличается по role) */}
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="/calendar"    element={<CalendarPage />} />
          <Route path="/groups"      element={<GroupsPage />} />
          <Route path="/groups/:id"  element={<GroupDetailPage />} />
          <Route path="/homework"            element={<HomeworkPage />} />
          <Route path="/attendance"          element={<AttendancePage />} />
          <Route path="/payments"            element={<PaymentsPage />} />
          <Route path="/individual-courses"      element={<IndividualCoursesPage />} />
          <Route path="/individual-courses/:id"  element={<IndividualCourseDetailPage />} />
          <Route path="/individual-lessons"      element={<IndividualLessonsPage />} />
          <Route path="/settings"            element={<SettingsPage />} />
          <Route path="/profile"             element={<Navigate to="/settings" replace />} />
          <Route path="/help"                element={<HelpPage />} />
          <Route path="/plans"               element={<PlansPage />} />
          <Route path="/materials"           element={<MaterialsPage />} />

          {/* Только учитель */}
          <Route path="/students"
            element={<RoleRoute role="teacher"><StudentsPage /></RoleRoute>} />

          {/* Только ученик — страница оплаты */}
          <Route path="/pay/:teacherId"
            element={<RoleRoute role="student"><PayPage /></RoleRoute>} />

          {/* Только ученик — личный словарь */}
          <Route path="/vocab"
            element={<RoleRoute role="student"><VocabPage /></RoleRoute>} />

          {/* Только ученик — журнал внешних занятий */}
          <Route path="/my-lessons"
            element={<RoleRoute role="student"><MyLessonsPage /></RoleRoute>} />

          {/* Только ученик — личные заметки */}
          <Route path="/my-notes"
            element={<RoleRoute role="student"><NotesPage /></RoleRoute>} />

          {/* Только ученик — прогресс-центр */}
          <Route path="/my-progress"
            element={<RoleRoute role="student"><ProgressPage /></RoleRoute>} />

          {/* AI-тесты — обе роли (учитель: библиотека; ученик: личные тесты + результаты) */}
          <Route path="/quiz"        element={<QuizGeneratorPage />} />
          <Route path="/quizzes"     element={<MyQuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizViewPage />} />

          {/* Только admin */}
          <Route path="/admin"
            element={<RoleRoute role="admin"><AdminPage /></RoleRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
