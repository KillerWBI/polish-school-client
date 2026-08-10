import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// Полнота словарей. Дырка в переводе не ломает сборку и не видна в разработке
// (i18next молча отдаёт ключ или английский фолбэк) — ловим её здесь.

const LOCALES_DIR = path.join(import.meta.dirname, 'locales')
const BASE = 'ru' // источник истины: на нём пишется интерфейс

const read = (lang, ns) =>
  JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, lang, `${ns}.json`), 'utf8'))

const exists = (lang, ns) => fs.existsSync(path.join(LOCALES_DIR, lang, `${ns}.json`))

// Плоский список путей до строк: { a: { b: 'x' } } → ['a.b']
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    return v && typeof v === 'object' && !Array.isArray(v) ? flatten(v, key) : [key]
  })

const namespaces = fs.readdirSync(path.join(LOCALES_DIR, BASE))
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace(/\.json$/, ''))

const languages = fs.readdirSync(LOCALES_DIR)
  .filter(d => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory())

describe('словари i18n', () => {
  it('находит языки и namespace', () => {
    expect(namespaces.length).toBeGreaterThan(0)
    expect(languages).toContain(BASE)
  })

  for (const lang of languages) {
    for (const ns of namespaces) {
      // Язык может ещё не иметь namespace целиком — это осознанный фолбэк на en,
      // а вот частично заполненный namespace означает пропущенные строки в интерфейсе.
      if (!exists(lang, ns)) continue

      it(`${lang}/${ns} — все ключи из ${BASE}`, () => {
        const target = read(lang, ns)
        const targetKeys = new Set(flatten(target))

        const missing = flatten(read(BASE, ns)).filter(k => {
          if (targetKeys.has(k)) return false
          // Формы множественного числа у языков разные: в русском есть _few/_many,
          // в английском только _one/_other. Достаточно, чтобы хоть одна форма была.
          const base = k.replace(/_(zero|one|two|few|many|other)$/, '')
          if (base === k) return true
          return ![...targetKeys].some(tk => tk === base || tk.startsWith(`${base}_`))
        })
        expect(missing, `нет перевода: ${missing.slice(0, 10).join(', ')}`).toEqual([])
      })
    }
  }
})

describe('справка /help', () => {
  const src = fs.readFileSync(path.join(import.meta.dirname, '..', 'pages', 'help', 'HelpPage.jsx'), 'utf8')

  it('каждая подпись макета v(...) есть в словарях', () => {
    const used = [...new Set([...src.matchAll(/v\('([^']+)'\)/g)].map(m => m[1]))]
    expect(used.length).toBeGreaterThan(50)

    for (const lang of languages) {
      if (!exists(lang, 'help')) continue
      const viz = read(lang, 'help').viz || {}
      const missing = used.filter(k => viz[k] === undefined)
      expect(missing, `${lang}: нет viz-ключей ${missing.slice(0, 5).join(', ')}`).toEqual([])
    }
  })

  it('число картинок совпадает с числом вопросов в словаре', () => {
    // Секции идут двумя массивами: сначала учительские (t.*), потом ученические (s.*)
    const blocks = [...src.matchAll(/id: '([^']+)',\s*\n\s*visuals: \[/g)]
    expect(blocks.length).toBeGreaterThan(10)

    const help = read(BASE, 'help')
    const teacherIds = Object.keys(help.t)
    let role = 't'
    let seen = 0

    for (const m of blocks) {
      const id = m[1]
      // как только повторно встретили первую учительскую секцию — начались ученические
      if (seen >= teacherIds.length) role = 's'
      seen++

      const start = m.index + m[0].length
      const nextIdx = src.indexOf("    id: '", start)
      const chunk = src.slice(start, nextIdx === -1 ? src.length : nextIdx)
      const visuals = (chunk.match(/<Shot>/g) || []).length

      const section = help[role][id]
      expect(section, `${role}.${id} нет в help.json`).toBeTruthy()
      const questions = Object.keys(section).filter(k => /^q\d+$/.test(k)).length
      expect(questions, `${role}.${id}: картинок ${visuals}, вопросов ${questions}`).toBe(visuals)
    }
  })
})
