// Универсальная кнопка: primary / secondary / ghost
const VARIANTS = {
  primary:
    'text-white btn-river hover:shadow-brand active:scale-[0.98]',
  secondary:
    'text-white bg-white/[0.07] border border-white/[0.20] hover:bg-white/[0.12] hover:border-brand-400/60 active:scale-[0.98]',
  ghost:
    'text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-[0.98]',
}

const SIZES = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-5 text-[15px] rounded-xl',
  lg: 'h-14 px-7 text-base rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  loading,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
