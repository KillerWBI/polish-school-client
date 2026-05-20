export default function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' }[size]
  return (
    <div className={`${sz} rounded-full border-white/20 border-t-brand-400 animate-spin ${className}`} />
  )
}

// Полноэкранный загрузчик
export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  )
}
