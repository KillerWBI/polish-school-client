import { forwardRef } from 'react'

// Поле ввода со статичной подписью сверху (светлый SaaS-стиль).
// readOnly — приглушённый вид: сразу видно, что значение изменить нельзя.
const Input = forwardRef(function Input(
  { label, type = 'text', error, readOnly = false, className = '', ...rest },
  ref
) {
  const field = readOnly
    ? 'text-slate-500 bg-slate-50 border-slate-200 cursor-default'
    : error
      ? 'text-slate-900 bg-white border-red-300 focus:border-red-500'
      : 'text-slate-900 bg-white border-slate-200 hover:border-slate-300 focus:border-blue-500'

  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>}
      <input
        ref={ref}
        type={type}
        readOnly={readOnly}
        className={`w-full h-11 px-3.5 text-sm border rounded-lg outline-none transition-colors placeholder:text-slate-400 ${
          readOnly ? '' : 'focus:ring-2 focus:ring-blue-500/15'
        } ${field}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input
