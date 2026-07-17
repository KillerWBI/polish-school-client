// Paddle.js v2 — оверлей-чекаут подписки. Ключи — из .env (VITE_PADDLE_*).
let paddlePromise = null
let successHandler = null // колбэк текущего чекаута (checkout.completed)

// Валидный ли email для пред-заполнения (Paddle отвергает нереальные TLD вроде .demo/.local)
const FAKE_TLD = /\.(demo|local|test|example|invalid|localhost)$/i
const usableEmail = (e) => typeof e === 'string' && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e) && !FAKE_TLD.test(e)

// Динамически подгружаем Paddle.js один раз и инициализируем.
function loadPaddle() {
  if (paddlePromise) return paddlePromise
  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN
  if (!token) return Promise.reject(new Error('Paddle не настроен (нет VITE_PADDLE_CLIENT_TOKEN)'))

  paddlePromise = new Promise((resolve, reject) => {
    const init = () => {
      try {
        const env = import.meta.env.VITE_PADDLE_ENV || 'sandbox'
        window.Paddle.Environment.set(env) // 'sandbox' | 'production'
        window.Paddle.Initialize({
          token,
          // eventCallback задаётся здесь (Paddle.js v2), а не в Checkout.open
          eventCallback: (ev) => {
            if (ev?.name === 'checkout.completed') successHandler?.(ev)
          },
        })
        resolve(window.Paddle)
      } catch (e) { reject(e) }
    }
    if (window.Paddle) return init()
    const s = document.createElement('script')
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    s.async = true
    s.onload = init
    s.onerror = () => reject(new Error('Не удалось загрузить Paddle.js'))
    document.head.appendChild(s)
  })
  return paddlePromise
}

// Открыть чекаут подписки. onSuccess вызовется при checkout.completed.
export async function openCheckout({ priceId, email, userId, onSuccess }) {
  if (!priceId) throw new Error('Не указан priceId тарифа (VITE_PADDLE_PRICE_*)')
  const Paddle = await loadPaddle()
  successHandler = onSuccess || null
  Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    ...(usableEmail(email) ? { customer: { email } } : {}), // не пред-заполняем нереальные email
    customData: userId ? { userId: String(userId) } : undefined,
    settings: { displayMode: 'overlay', theme: 'light' },
  })
}

export const paddleConfigured = () => !!import.meta.env.VITE_PADDLE_CLIENT_TOKEN
