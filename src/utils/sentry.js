// Lazy-loaded Sentry: SDK грузится только если задан VITE_SENTRY_DSN.
// Без DSN — весь @sentry/react (~50KB) остаётся вне бандла.
let _s = null

export function initSentry(dsn) {
  if (!dsn) return
  import('@sentry/react').then(s => {
    s.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
    })
    _s = s
  })
}

export function captureException(err, extra) {
  _s?.captureException(err, extra)
}
