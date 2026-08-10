// Хранилище JWT-токена в localStorage
const TOKEN_KEY = 'platform_token'
// CSRF-токен: сервер кладёт его в httpOnly-cookie и дублирует в теле ответа.
// Cookie ставит домен API, а он другой — прочитать её из JS фронта нельзя,
// поэтому значение храним у себя и шлём заголовком X-CSRF-Token.
const CSRF_KEY = 'platform_csrf'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CSRF_KEY)
}

export const getCsrfToken = () => localStorage.getItem(CSRF_KEY)

export const setCsrfToken = (token) => {
  if (token) localStorage.setItem(CSRF_KEY, token)
}
