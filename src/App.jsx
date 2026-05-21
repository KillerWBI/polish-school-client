import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage        from './pages/landing/LandingPage'
import WelcomePage        from './pages/welcome/WelcomePage'
import TeacherLoginPage   from './pages/auth/TeacherLoginPage'
import AppLayout          from './components/layout/AppLayout'
import PrivateRoute       from './components/layout/PrivateRoute'
import RoleRoute          from './components/layout/RoleRoute'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/teacher-login"  element={<TeacherLoginPage />} />

        {/* После входа */}
        <Route path="/welcome" element={<PrivateRoute><WelcomePage /></PrivateRoute>} />

        {/* Кабинет — все страницы через AppLayout */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>

          {/* Общие — оба роля видят (внутри страница отличается по role) */}
          <Route path="/calendar"    element={<CalendarPage />} />
          <Route path="/dashboard"   element={<Navigate to="/calendar" replace />} />
          <Route path="/groups"      element={<GroupsPage />} />
          <Route path="/groups/:id"  element={<GroupDetailPage />} />
          <Route path="/homework"            element={<HomeworkPage />} />
          <Route path="/attendance"          element={<AttendancePage />} />
          <Route path="/payments"            element={<PaymentsPage />} />
          <Route path="/individual-courses"      element={<IndividualCoursesPage />} />
          <Route path="/individual-courses/:id"  element={<IndividualCourseDetailPage />} />
          <Route path="/individual-lessons"      element={<IndividualLessonsPage />} />
          <Route path="/profile"             element={<ProfilePage />} />

          {/* Только учитель */}
          <Route path="/students"
            element={<RoleRoute role="teacher"><StudentsPage /></RoleRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
