import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// Публичные страницы: адрес → приоритет и частота обновления в sitemap.
// Кабинет сюда не попадает — он под авторизацией и закрыт в robots.txt.
const PUBLIC_PAGES = [
  ['/',             '1.0', 'weekly'],
  ['/for-students', '0.9', 'weekly'],
  ['/support',      '0.4', 'monthly'],
  ['/privacy',      '0.3', 'yearly'],
  ['/terms',        '0.3', 'yearly'],
  ['/refund',       '0.3', 'yearly'],
]

// Языки, для которых на публичных страницах отдаём hreflang.
// Без них Google считает языковые версии разными страницами с дублем контента.
const LANGS = ['ru', 'en', 'pl', 'uk']

// Разделы кабинета, закрытые от индексации
const PRIVATE_PATHS = [
  '/dashboard', '/groups', '/lessons', '/homework', '/attendance', '/payments', '/pay/',
  '/settings', '/profile', '/admin', '/calendar', '/students', '/individual-courses',
  '/individual-lessons', '/plans', '/materials', '/notifications', '/diary', '/topics',
  '/study', '/vocab', '/tests', '/quiz', '/quizzes', '/help',
]

const sitemapXml = (site) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PAGES.map(([path, priority, freq]) => `  <url>
    <loc>${site}${path}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const robotsTxt = (site) => `User-agent: *
Allow: /

# Страницы приложения — не индексировать (требуют авторизации)
${PRIVATE_PATHS.map((p) => `Disallow: ${p}`).join('\n')}

Sitemap: ${site}/sitemap.xml
`

const hreflangTags = (site) => [
  ...LANGS.map((l) => `    <link rel="alternate" hreflang="${l}" href="${site}/?lang=${l}" />`),
  `    <link rel="alternate" hreflang="x-default" href="${site}/" />`,
].join('\n')

/**
 * Домен живёт в одном месте — VITE_SITE_URL.
 * Раньше он был вписан руками в index.html, robots.txt и sitemap.xml: при смене домена
 * что-то из трёх обязательно забывалось, и og:image/sitemap уводили на старый адрес.
 */
function siteUrlPlugin(siteUrl) {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      return html
        .replace(/%SITE_URL%/g, siteUrl)
        .replace('%HREFLANG%', hreflangTags(siteUrl))
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt',  source: robotsTxt(siteUrl) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Хвостовой слэш срезаем: в шаблонах пути всегда начинаются со слэша
  const siteUrl = (env.VITE_SITE_URL || 'https://peravenor.com').replace(/\/+$/, '')

  return {
    // cloudflare() подставляет каталог сборки в wrangler.jsonc и поднимает воркер
    // в `wrangler dev`. В тестах он не нужен и только тянет за собой воркер-рантайм.
    plugins: [
      react(),
      tailwindcss(),
      siteUrlPlugin(siteUrl),
      ...(mode === 'test' ? [] : [cloudflare()]),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      include: ['src/**/*.test.{js,jsx}'],
    },
  }
})
