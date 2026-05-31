import client from './client'

// POST /auth/register — публичная регистрация (student)
export const register = async ({ name, email, password }) => {
  const { data } = await client.post('/auth/register', { name, email, password })
  return data.data
}

// POST /auth/register-teacher — открытая регистрация учителя
export const registerTeacher = async ({ name, email, password }) => {
  const { data } = await client.post('/auth/register-teacher', { name, email, password })
  return data.data
}

// POST /auth/login — вход для любой роли
export const login = async ({ email, password }) => {
  const { data } = await client.post('/auth/login', { email, password })
  return data.data
}

// GET /auth/me — текущий пользователь (по токену)
export const fetchMe = async () => {
  const { data } = await client.get('/auth/me')
  return data.data
}

// PUT /users/:id — обновить имя
export const updateUserName = async (id, name) => {
  const { data } = await client.put(`/users/${id}`, { name })
  return data.data
}

// PUT /auth/password — сменить пароль
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await client.put('/auth/password', { currentPassword, newPassword })
  return data.data
}

// GET /auth/verify-email?token=... — подтвердить email
export const verifyEmail = async (token) => {
  const { data } = await client.get('/auth/verify-email', { params: { token } })
  return data.data
}

// POST /auth/resend-verification — повторно отправить письмо
export const resendVerification = async () => {
  const { data } = await client.post('/auth/resend-verification')
  return data.data
}
