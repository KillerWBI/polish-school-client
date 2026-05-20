# Frontend — Технологический стек

## Зависимости

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| react | 19 | UI-библиотека |
| react-dom | 19 | Рендеринг в DOM |
| react-router-dom | 7 | Клиентский роутинг (BrowserRouter) |
| axios | 1 | HTTP-клиент для запросов к бэкенду |
| tailwindcss | 4 | Utility-first CSS-фреймворк |
| @tailwindcss/vite | 4 | Vite-плагин для Tailwind 4 (подключён в vite.config.js) |
| gsap | 3 | Анимации (ScrollTrigger, timeline, scrub) |
| @fullcalendar/react | 6 | Обёртка FullCalendar для React |
| @fullcalendar/daygrid | 6 | Вид «месяц» и «неделя» |
| @fullcalendar/interaction | 6 | Кликабельные события |

## Dev-зависимости

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| vite | 8 | Сборщик / dev-сервер |
| @vitejs/plugin-react | 6 | JSX трансформация + Fast Refresh |
| eslint | 10 | Линтер |
| eslint-plugin-react-hooks | 7 | Правила для хуков |
| eslint-plugin-react-refresh | 0.5 | Совместимость с Fast Refresh |

## Скрипты

```bash
npm run dev      # dev-сервер Vite (http://localhost:5173)
npm run build    # production-сборка в dist/
npm run preview  # локальный preview prod-сборки
npm run lint     # ESLint
```

## Переменные окружения (`.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

В production заменяется на Railway-URL бэкенда.  
Все переменные должны начинаться с `VITE_` — иначе Vite не включает в бандл.

## Цветовая тема

Тёмная космическая палитра `#0F1629`. Кастомные Tailwind-токены через `@theme` в `index.css`:

```css
@theme {
  --color-brand-600: #8B5CF6;   /* основной фиолетовый */
  --color-pink-accent: #EC4899; /* розовый акцент */
  --color-ink:      #EEF2FF;    /* основной текст */
  --color-ink-soft: #C5D0E8;    /* вторичный текст */
  --color-ink-muted: #6B7FA3;   /* плейсхолдеры */
}
```

Полная история палитр: `DESIGN.md` в корне проекта.

## Совместимость

- Браузеры: современные (ES2020+, нет IE)
- Node.js для сборки: 20+
