import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, setToken, removeToken, getCsrfToken, setCsrfToken } from './token'

describe('хранилище токенов', () => {
  beforeEach(() => localStorage.clear())

  it('кладёт и отдаёт access-токен', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
  })

  it('не затирает токен пустым значением (ответ без токена не должен разлогинивать)', () => {
    setToken('abc')
    setToken(undefined)
    setToken('')
    expect(getToken()).toBe('abc')
  })

  it('хранит CSRF-токен отдельно и с теми же правилами', () => {
    setCsrfToken('csrf-1')
    expect(getCsrfToken()).toBe('csrf-1')
    setCsrfToken(undefined)
    expect(getCsrfToken()).toBe('csrf-1')
  })

  it('выход чистит оба токена — иначе чужой CSRF уедет в следующую сессию', () => {
    setToken('abc')
    setCsrfToken('csrf-1')
    removeToken()
    expect(getToken()).toBeNull()
    expect(getCsrfToken()).toBeNull()
  })
})
