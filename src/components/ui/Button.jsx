// Универсальная кнопка (светлый SaaS-стиль)
const VARIANTS = {
  primary:   'text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
  secondary: 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  ghost:     'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  danger:    'text-white bg-red-600 hover:bg-red-700',
  dark:      'text-white bg-slate-900 hover:bg-slate-800',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-[15px] rounded-xl',
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
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
