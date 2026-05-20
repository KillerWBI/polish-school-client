import { useContext } from 'react'
import { AuthContext } from '../store/authStore'

export default function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return {
    ...ctx,
    isTeacher: ctx.user?.role === 'teacher',
    isStudent: ctx.user?.role === 'student',
    isAuthenticated: !!ctx.user,
  }
}
