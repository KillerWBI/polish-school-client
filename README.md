# Peravenor — фронтенд

Веб-приложение [peravenor.com](https://peravenor.com): рабочее место преподавателя и кабинет
ученика по любому предмету — группы, уроки, домашние задания, посещаемость и финансы.
Ученик может учиться и без преподавателя: свои темы, адаптивные AI-тесты, словарь, заметки.

Бэкенд — в репозитории [polish-school](https://github.com/KillerWBI/polish-school).

## Стек

React 19 · Vite 8 · TailwindCSS 4 · React Router 7 · TanStack Query · i18next · Vitest
Хостинг — Cloudflare Workers.

## Запуск

```bash
npm install
cp .env.example .env      # VITE_API_URL и прочее
npm run dev
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Дев-сервер |
| `npm run build` | Продакшен-сборка |
| `npm run lint` | ESLint по всему репозиторию |
| `npm test` | Vitest |

## Домен живёт в одной переменной

`VITE_SITE_URL` — из неё на сборке подставляются `canonical`, `og:url`, `og:image`,
`hreflang` и генерируются `sitemap.xml` с `robots.txt` (см. `vite.config.js`).
При смене домена больше во фронте править нечего.

## Локализация

7 языков (ru/en/pl/uk/de/es/fr) × 7 словарей. Файлы подключаются через `import.meta.glob` —
новый словарь регистрировать руками не нужно. Полнота проверяется тестом
`src/i18n/locales.test.js`: пропущенный ключ роняет CI.

## Ассеты бренда

Знак абстрактный (пузырь + звезда + галочка), буквы в нём нет — при смене названия
перерисовывать не требуется. Картинка для соцсетей собирается из
[`docs/og-source.svg`](docs/og-source.svg):

```bash
node -e "const s=require('sharp'),f=require('fs');s(f.readFileSync('docs/og-source.svg')).resize(1200,630,{fit:'fill'}).png().toFile('public/og.png')"
```

## Ветки

`main` — продакшен (деплой автоматом при push), `dev` — работа.
Выкатка через PR `dev` → `main`.
