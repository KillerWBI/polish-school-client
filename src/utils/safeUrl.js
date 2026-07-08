// Защита от javascript: URI в href/src-атрибутах.
// Возвращает url если схема http/https, иначе undefined (атрибут не рендерится).
export const safeUrl = (url) => {
  if (!url) return undefined
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}
