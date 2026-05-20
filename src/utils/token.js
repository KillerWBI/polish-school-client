// Хранилище JWT-токена в localStorage
const TOKEN_KEY = 'platform_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => localStorage.removeItem(TOKEN_KEY)
