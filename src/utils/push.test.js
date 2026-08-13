import { describe, it, expect } from 'vitest'
import { urlBase64ToUint8Array } from './push'

// Конвертация VAPID-ключа — единственное место в push-потоке с нетривиальной логикой,
// и ошибка в ней проявляется невнятно: браузер бросает InvalidCharacterError уже внутри
// subscribe(), без связи с исходной строкой. Поэтому проверяем её отдельно.
describe('urlBase64ToUint8Array', () => {
  // Настоящий публичный VAPID-ключ (87 символов base64url, без padding)
  const VAPID = 'BLpPoOYeLdDz52z8PF-yEfULOU2yyIeoQ0f9VRWJdKGnkAx6rkBE-Zt2B8556pIM00_eE2zXRp-BVLFi-umjfYI'

  it('даёт ровно 65 байт — несжатую точку кривой P-256', () => {
    const out = urlBase64ToUint8Array(VAPID)
    expect(out).toBeInstanceOf(Uint8Array)
    expect(out.length).toBe(65)      // 1 байт маркера + X(32) + Y(32)
    expect(out[0]).toBe(0x04)        // 0x04 = точка записана несжато
  })

  it('переводит алфавит base64url в base64', () => {
    // '-' и '_' обязаны стать '+' и '/', иначе atob не примет строку.
    // Проверяем через ключ, где оба символа есть.
    expect(VAPID).toContain('-')
    expect(VAPID).toContain('_')
    expect(() => urlBase64ToUint8Array(VAPID)).not.toThrow()
  })

  it('дописывает отброшенный padding', () => {
    // 'AQ' → длина 2, не кратна 4: без '==' в конце atob бросит ошибку
    expect(urlBase64ToUint8Array('AQ')).toEqual(new Uint8Array([0x01]))
    // 'AQI' → длина 3, нужен один '='
    expect(urlBase64ToUint8Array('AQI')).toEqual(new Uint8Array([0x01, 0x02]))
    // длина уже кратна 4 — padding добавлять не нужно и нельзя
    expect(urlBase64ToUint8Array('AQID')).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
  })

  it('сохраняет байты со старшим битом', () => {
    // charCodeAt возвращает код символа; для байтов > 127 наивная реализация
    // через Buffer/строку легко теряет значение. '//8' = 0xFF 0xFF
    expect(urlBase64ToUint8Array('__8')).toEqual(new Uint8Array([0xff, 0xff]))
  })
})
