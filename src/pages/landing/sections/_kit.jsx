// Примитивы светлого лендинга.
// Вынесены в одно место потому, что до этого одиннадцать секций держали
// собственные копии обёртки, карточки и рамки макета — и разъезжались.
import { IconCheck } from '../../../components/ui/icons'

/* ── Оболочка секции ──────────────────────────────────────────────
   Секции разделены сменой фона, а не линией: белый ↔ #F7FAFB. */
export function SectionShell({ id, tone = 'white', className = '', children }) {
  const bg = tone === 'alt' ? 'bg-[#F7FAFB]' : 'bg-white'
  return (
    <section id={id} className={`${bg} ${className}`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">{children}</div>
    </section>
  )
}

/* ── Шапка секции по центру: надзаголовок + заголовок + подзаголовок ── */
export function SectionHead({ label, title, subtitle, align = 'center' }) {
  const a = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={`${a} max-w-2xl`}>
      {label && <p className="eyebrow mb-3">{label}</p>}
      <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-[2.6rem] leading-[1.15] tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-[#5A6B7C] text-base sm:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  )
}

/* ── Плитка-иконка ────────────────────────────────────────────────
   Три тона, чтобы соседние карточки в ряду различались с одного взгляда. */
const TONES = {
  mint:  { box: 'bg-[#E4F6F4]', ink: 'text-teal-600' },
  lilac: { box: 'bg-[#EDE9FE]', ink: 'text-[#7C3AED]' },
  peach: { box: 'bg-[#FFEEE4]', ink: 'text-[#EA6D24]' },
  amber: { box: 'bg-[#FEF3C7]', ink: 'text-[#B45309]' },
}

export function IconTile({ icon: Glyph, tone = 'mint', size = 'md' }) {
  const t = TONES[tone] ?? TONES.mint
  const box = size === 'sm' ? 'w-10 h-10 rounded-lg' : 'w-11 h-11 rounded-xl'
  return (
    <span className={`${box} ${t.box} ${t.ink} inline-flex items-center justify-center shrink-0`}>
      <Glyph size={size === 'sm' ? 18 : 20} strokeWidth={2} />
    </span>
  )
}

/* ── Буллет-галочка в бирюзовом кружке ── */
export function Check({ children }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-100 text-teal-700 inline-flex items-center justify-center shrink-0">
        <IconCheck size={12} strokeWidth={3} />
      </span>
      <span className="text-[15px] text-[#3D4C5C] leading-relaxed">{children}</span>
    </li>
  )
}

/* ── Рамка «скриншота» ────────────────────────────────────────────
   Цветная шапка + мягкое свечение того же тона позади — именно это
   заставляет DOM-макет читаться как снимок экрана. */
const FRAME_TONES = {
  teal:  { bar: 'bg-teal-500',      glow: 'bg-teal-200/50' },
  lilac: { bar: 'bg-[#7C3AED]',     glow: 'bg-[#DDD6FE]/60' },
  peach: { bar: 'bg-[#F97316]',     glow: 'bg-[#FED7AA]/60' },
}

// isolate обязателен: без собственного контекста наложения -z-10 уходит в корневой,
// и свечение прячется под непрозрачным фоном секции.
export function BrowserFrame({ tone = 'teal', label, children, className = '' }) {
  const t = FRAME_TONES[tone] ?? FRAME_TONES.teal
  return (
    <div className={`relative isolate ${className}`}>
      {/* свечение-подложка; за пределами потока, кликам не мешает */}
      <div aria-hidden className={`absolute -inset-6 ${t.glow} blob blur-3xl -z-10`} />
      <div className="rounded-2xl overflow-hidden border border-[#E3E9ED] bg-white shadow-[0_24px_60px_-30px_rgba(16,24,40,0.35)]">
        <div className={`flex items-center gap-1.5 px-3.5 h-9 ${t.bar}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
          {label && <span className="ml-2 text-[11px] text-white/85 truncate">{label}</span>}
        </div>
        <div className="bg-[#F7FAFB]">{children}</div>
      </div>
    </div>
  )
}

/* ── Кнопки лендинга ── */
export function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[15px] font-semibold transition-colors cursor-pointer shadow-[0_10px_24px_-12px_rgba(43,176,174,0.9)] ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-[1.5px] border-teal-500 text-teal-700 hover:bg-teal-50 text-[15px] font-semibold transition-colors cursor-pointer bg-white ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
