import { describe, it, expect } from 'vitest'
import { safeUrl } from './safeUrl'

// Ссылки на урок и на чат вводит преподаватель — это свободный текст, который
// попадает в href. Тест держит границу: в href уходит только http(s).
describe('safeUrl', () => {
  it('пропускает http и https', () => {
    expect(safeUrl('https://meet.jit.si/lf-abc')).toBe('https://meet.jit.si/lf-abc')
    expect(safeUrl('http://example.com/x?y=1')).toBe('http://example.com/x?y=1')
  })

  it('режет javascript: и data: — иначе это XSS в сессии ученика', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeUrl('JavaScript:alert(1)')).toBeUndefined()
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(safeUrl('vbscript:msgbox(1)')).toBeUndefined()
  })

  it('режет то, что вообще не URL, и пустые значения', () => {
    expect(safeUrl('не ссылка')).toBeUndefined()
    expect(safeUrl('')).toBeUndefined()
    expect(safeUrl(null)).toBeUndefined()
    expect(safeUrl(undefined)).toBeUndefined()
  })
})
