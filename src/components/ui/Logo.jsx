// Логотип-знак: пузырь + звезда по центру + хвост-галочка (обучение, «понял/верно»).
// Синяя плитка + белый знак — читается на любом фоне и в маленьком размере.
// id градиента делаем уникальным на каждый экземпляр, чтобы не конфликтовали на одной странице.
let uid = 0
export default function Logo({ size = 28, className = '' }) {
  const gid = `dk-${++uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} role="img" aria-label="Diklaro">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" rx="15" fill={`url(#${gid})`} />
      <path d="M15 13 H45 C47.2 13 49 14.8 49 17 V30 C49 32.2 47.2 34 45 34 H15 C12.8 34 11 32.2 11 30 V17 C11 14.8 12.8 13 15 13 Z" fill="#fff" />
      <path d="M30 15 C30.9 21 31.9 22 38.5 23.5 C31.9 25 30.9 26 30 32 C29.1 26 28.1 25 21.5 23.5 C28.1 22 29.1 21 30 15 Z" fill="#2563eb" />
      <path d="M21 37 l4.5 5 L34 33.5" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
