# Frontend — Технологический стек

**Обновлено 2026-07-09.**

## Зависимости

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| react | 19 | UI-библиотека |
| react-dom | 19 | Рендеринг в DOM |
| react-router-dom | 7 | Клиентский роутинг (BrowserRouter) |
| axios | 1 | HTTP-клиент для запросов к бэкенду |
| tailwindcss | 4 | Utility-first CSS-фреймворк |
| @tailwindcss/vite | 4 | Vite-плагин для Tailwind 4 |
| sonner | — | Тосты (success/error) |
| recharts | 2.15 | Графики (lazy-импорт) |
| lucide-react | — | Иконки (в кабинете) |
| gsap | 3 | Анимации лендинга (ScrollTrigger, timeline, scrub) |
| @fullcalendar/react | 6 | Обёртка FullCalendar для React |
| @fullcalendar/daygrid | 6 | Вид «месяц» |
| @fullcalendar/interaction | 6 | Кликабельные события |
| @fullcalendar/core | 6 | + ru locale (`import ruLocale from '@fullcalendar/core/locales/ru'`) |
| @sentry/react | — | Мониторинг ошибок (off без DSN) |

## Dev-зависимости

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| vite | 8 | Сборщик / dev-сервер |
| @vitejs/plugin-react | 6 | JSX трансформация + Fast Refresh |
| vite-plugin-pwa | — | PWA: manifest + service worker |
| eslint | 10 | Линтер |
| eslint-plugin-react-hooks | 7 | Правила для хуков |
| eslint-plugin-react-refresh | 0.5 | Совместимость с Fast Refresh |

## Скрипты

```bash
npm run dev      # dev-сервер Vite (http://localhost:5173)
npm run build    # production-сборка в dist/
npm run preview  # локальный preview prod-сборки (тест PWA — SW работает только в PROD)
npm run lint     # ESLint
```

## Переменные окружения (`.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

В production — Railway-URL бэкенда. Все переменные должны начинаться с `VITE_`.

## Цветовая тема

**Приложение (кабинет)** — светлый SaaS, синий акцент:
- Фон: `white / slate-50`
- Акцент: `blue-600` / `blue-700`
- Иконки: `lucide-react`

**Лендинг** — тёмный технологичный моно (`#0F1629`):
- Акцент: `#8B5CF6` (фиолетовый)
- Анимации: GSAP

## PWA

- `public/manifest.webmanifest` — name, иконки, `theme_color: #2563eb`, `start_url: /dashboard`, `display: standalone`
- `public/icon.svg` — maskable, буква L
- `public/sw.js` — навигация network-first (свежий HTML после деплоя), статик cache-first
- Регистрируется в `main.jsx` **только в PROD** (в dev SW снимается, чтобы не ломать HMR)

## Совместимость

- Браузеры: современные (ES2020+, нет IE)
- Node.js для сборки: 20+
