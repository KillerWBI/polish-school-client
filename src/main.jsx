import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './store/authStore.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Мониторинг ошибок фронта. Пусто = выключено (dev). DSN задаётся в .env как VITE_SENTRY_DSN.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  })
}

// PWA: регистрируем service worker только в проде (в dev он ломал бы Vite HMR).
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  } else {
    // dev — снимаем возможный старый SW, чтобы не мешал разработке
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()))
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster
          theme="light"
          position="top-right"
          richColors
          closeButton
        />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
)
