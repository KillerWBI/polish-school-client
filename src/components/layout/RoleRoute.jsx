import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

// Защита маршрута по роли. Если роль не совпадает — редирект на /calendar
export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1629]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (user?.role !== role) return <Navigate to="/calendar" replace />
  return children
}
