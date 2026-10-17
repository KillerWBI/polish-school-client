import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

// Защита маршрута по роли. Если роль не совпадает — редирект на /calendar
export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1629]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    )
  }

  // У админа user.role — текущий режим (учитель/ученик), поэтому админку проверяем по isAdmin
  const allowed = role === 'admin' ? user?.isAdmin : user?.role === role
  if (!allowed) return <Navigate to="/calendar" replace />
  return children
}
