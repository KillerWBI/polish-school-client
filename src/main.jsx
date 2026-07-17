import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './store/authStore.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initSentry } from './utils/sentry.js'
import i18n from './i18n'
import { runGeoDetect } from './i18n/detectLocale.js'

// Sentry грузится динамически только при наличии DSN (экономит ~50KB бандла в dev и без DSN).
initSentry(import.meta.env.VITE_SENTRY_DSN)

// Гео-определение языка по IP (один раз, если пользователь не выбрал язык вручную).
runGeoDetect(i18n)

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
