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
