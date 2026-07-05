import { forwardRef } from 'react'

// Поле ввода со статичной подписью сверху (светлый SaaS-стиль)
const Input = forwardRef(function Input(
  { label, type = 'text', error, className = '', ...rest },
  ref
) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`w-full h-11 px-3.5 text-sm text-slate-900 bg-white border rounded-lg outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/15 ${
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500'
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input
