// Единый контейнер страницы кабинета: центрирует контент и задаёт стандартные отступы.
// Без него страницы задавали свой max-w без mx-auto → прижимались влево, справа пусто.
//   width="wide" (по умолчанию) — списки/обзоры/detail, широкая колонка
//   width="form" — формы и «читательские» страницы (комфортная центрированная ширина)
//   width="narrow" — совсем узкий контент
export default function PageContainer({ children, width = 'wide', className = '' }) {
  const max = width === 'narrow' ? 'max-w-3xl' : width === 'form' ? 'max-w-4xl' : 'max-w-[1240px]'
  return <div className={`p-5 sm:p-7 mx-auto w-full ${max} ${className}`}>{children}</div>
}
