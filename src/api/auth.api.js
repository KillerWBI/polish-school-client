import client from './client'

// POST /auth/register — публичная регистрация (student)
export const register = async ({ name, email, password }) => {
  const { data } = await client.post('/auth/register', { name, email, password })
  return data.data
}

// POST /auth/register-teacher — регистрация учителя (требует teacherSecret)
export const registerTeacher = async ({ name, email, password, teacherSecret }) => {
  const { data } = await client.post('/auth/register-teacher', { name, email, password, teacherSecret })
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
