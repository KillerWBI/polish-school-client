import client from './client'

// Ежедневная сессия повторения — due-карточки со всех треков + словаря.
export const getSession = async (signal) => {
  const { data } = await client.get('/study/session', { signal })
  return data // { data: [{ id, kind, front, back, context }], meta: { cards, vocab, total } }
}

// Единый вход результата повторения (карточка трека или слово словаря)
export const reviewItem = async (kind, id, correct) => {
  const { data } = await client.post('/study/review', { kind, id, correct })
  return data.data
}

// Слабые места — практикованные шаги с низким обладанием (по всем трекам)
export const getWeakSpots = async (signal) => {
  const { data } = await client.get('/study/weak-spots', { signal })
  return data.data
}
