import { describe, it, expect } from 'vitest'
import { normAnswer, exactMatch } from './answerMatch'

// Те же случаи, что в серверном tests/quiz-score.test.js — копии должны вести себя одинаково
describe('Точный ответ: нормализация (копия серверной)', () => {
  it('регистр, ё/е, пробелы, концевая пунктуация', () => {
    expect(normAnswer('  Пётр  I. ')).toBe('петр i')
    expect(exactMatch('москва!', ['Москва'])).toBe(true)
    expect(exactMatch('ньютон', ['ньюто́н'])).toBe(true)
    expect(exactMatch('йод', ['йод'])).toBe(true)
  })
  it('числа: запятая/точка, пробелы в разрядах, 25.0 = 25', () => {
    expect(exactMatch('0,25', ['0.25'])).toBe(true)
    expect(exactMatch('1 000', ['1000'])).toBe(true)
    expect(exactMatch('25.0', ['25'])).toBe(true)
  })
  it('пробел между числом и единицей не важен; число без единицы — не то же, что выражение', () => {
    expect(exactMatch('30Н', ['30 Н'])).toBe(true)
    expect(exactMatch('25 %', ['25%'])).toBe(true)
    expect(exactMatch('2', ['2x'])).toBe(false)
    expect(exactMatch('3', ['3/4'])).toBe(false)
  })
  it('разные числа не совпадают', () => {
    expect(exactMatch('2.5', ['25'])).toBe(false)
    expect(exactMatch('250', ['25'])).toBe(false)
  })
  it('засчитывается любая из допустимых форм', () => {
    expect(exactMatch('25 процентов', ['25%', '25', '25 процентов'])).toBe(true)
  })
  it('пустой ответ и не строка — неверно', () => {
    expect(exactMatch('', ['25'])).toBe(false)
    expect(exactMatch(undefined, ['25'])).toBe(false)
    expect(exactMatch(['25'], ['25'])).toBe(false)
  })
})
