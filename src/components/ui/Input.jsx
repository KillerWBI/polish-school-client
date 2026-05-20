import { useState, forwardRef } from 'react'

// Поле ввода с плавающей подписью и ошибкой
const Input = forwardRef(function Input(
  { label, type = 'text', error, className = '', ...rest },
  ref
) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!rest.value || !!rest.defaultValue)
  const active = focused || hasValue

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        type={type}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); setHasValue(!!e.target.value); rest.onBlur?.(e) }}
        onChange={(e) => { setHasValue(!!e.target.value); rest.onChange?.(e) }}
        className={`peer w-full h-14 px-4 pt-5 pb-1 text-[15px] text-white bg-white/[0.07] border rounded-xl outline-none transition-all duration-200 ${
          error
            ? 'border-pink-accent/70 focus:border-pink-accent'
            : 'border-white/[0.15] hover:border-white/[0.28] focus:border-brand-400 focus:bg-white/[0.10]'
        }`}
        {...rest}
      />
      {label && (
        <label
          className={`absolute left-4 pointer-events-none transition-all duration-200 ${
            active
              ? 'top-1.5 text-[11px] font-medium ' + (error ? 'text-pink-accent' : 'text-brand-400')
              : 'top-1/2 -translate-y-1/2 text-[15px] text-slate-400'
          }`}
        >
          {label}
        </label>
      )}
      {error && (
        <p className="mt-1.5 ml-1 text-xs text-pink-accent">{error}</p>
      )}
    </div>
  )
})

export default Input
