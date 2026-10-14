import { describe, it, expect } from 'vitest'
import { groupModules, isStepLocked } from './modules'

const step = (id, mastery, moduleId, moduleTitle) => ({ id, title: id, mastery, moduleId, moduleTitle })

describe('groupModules', () => {
  it('собирает подтемы в модули по порядку появления, освоение модуля — среднее', () => {
    const mods = groupModules([step('a', 80, 'm1', 'Основы'), step('b', 40, 'm1', 'Основы'), step('c', 0, 'm2', 'Финансы')])
    expect(mods.map((m) => [m.id, m.title, m.steps.map((s) => s.id), m.mastery])).toEqual([
      ['m1', 'Основы', ['a', 'b'], 60],
      ['m2', 'Финансы', ['c'], 0],
    ])
  })

  it('старый трек без moduleId — один модуль без названия', () => {
    const mods = groupModules([step('a', 10), step('b', 20)])
    expect(mods).toHaveLength(1)
    expect(mods[0]).toMatchObject({ id: 'default', title: null, mastery: 15 })
  })
})

describe('isStepLocked', () => {
  it('несколько модулей: модуль закрыт, пока предыдущий в среднем < 50%; внутри модуля всё открыто', () => {
    const weak = groupModules([step('a', 30, 'm1'), step('b', 0, 'm1'), step('c', 0, 'm2')])
    expect(isStepLocked(weak, 0, 1)).toBe(false)
    expect(isStepLocked(weak, 1, 0)).toBe(true)
    const strong = groupModules([step('a', 70, 'm1'), step('b', 40, 'm1'), step('c', 0, 'm2')])
    expect(isStepLocked(strong, 1, 0)).toBe(false)
  })

  it('один модуль: шаг закрыт, пока предыдущий шаг < 50% — как до модулей', () => {
    const one = groupModules([step('a', 60), step('b', 10), step('c', 0)])
    expect([0, 1, 2].map((i) => isStepLocked(one, 0, i))).toEqual([false, false, true])
  })
})
