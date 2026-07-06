import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage        from './pages/landing/LandingPage'
import StudentLandingPage from './pages/landing/StudentLandingPage'
import AuthPage           from './pages/auth/AuthPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'
import VerifyEmailPage    from './pages/auth/VerifyEmailPage'
import AppLayout          from './components/layout/AppLayout'
import PrivateRoute       from './components/layout/PrivateRoute'
import RoleRoute          from './components/layout/RoleRoute'
import DashboardPage      from './pages/dashboard/DashboardPage'
import CalendarPage       from './pages/calendar/CalendarPage'
import GroupsPage         from './pages/groups/GroupsPage'
import GroupDetailPage    from './pages/groups/GroupDetailPage'
import StudentsPage       from './pages/students/StudentsPage'
import HomeworkPage       from './pages/homework/HomeworkPage'
import AttendancePage     from './pages/attendance/AttendancePage'
import PaymentsPage       from './pages/payments/PaymentsPage'
import ProfilePage        from './pages/profile/ProfilePage'
import IndividualCoursesPage      from './pages/individual-courses/IndividualCoursesPage'
import IndividualCourseDetailPage from './pages/individual-courses/IndividualCourseDetailPage'
import IndividualLessonsPage      from './pages/individual-lessons/IndividualLessonsPage'
import HelpPage                    from './pages/help/HelpPage'

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

        {/* Кабинет — все страницы через AppLayout */}
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
          <Route path="/profile"             element={<ProfilePage />} />
          <Route path="/help"                element={<HelpPage />} />

          {/* Только учитель */}
          <Route path="/students"
            element={<RoleRoute role="teacher"><StudentsPage /></RoleRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
