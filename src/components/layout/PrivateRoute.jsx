import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

// Защита маршрутов: пускает только авторизованных
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}
