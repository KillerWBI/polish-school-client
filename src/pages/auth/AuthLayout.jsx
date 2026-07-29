import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Общий каркас страниц входа: тёмная бренд-панель слева, форма справа.
// Раньше своя была только у страницы входа, а восстановление и смена пароля
// показывали узкую карточку посреди пустого экрана.
//   panelTitle / panelBullets — содержимое левой панели (на телефоне не видно)
export default function AuthLayout({ panelLabel, panelTitle, panelBullets = [], children }) {
  const { t } = useTranslation('app')
  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      {/* ЛЕВО — тёмная бренд-панель (десктоп) */}
      <aside className="hidden lg:flex flex-col justify-between w-[44%] max-w-xl bg-[#18181C] text-[#EDEDED] p-12 relative overflow-hidden">
        <div className="absolute inset-0 landing-grid opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_20%,#000_30%,transparent_100%)]" />
        <div className="absolute -top-32 -left-20 w-[500px] h-[400px] rounded-full bg-brand-600/15 blur-[120px]" />

        <Link to="/" className="relative flex items-center gap-2 w-fit">
          <span className="w-2 h-2 rounded-[2px] bg-brand-500" />
          <span className="font-mono text-sm font-semibold">Diklario</span>
        </Link>

        <div className="relative">
          {panelLabel && <p className="mono-label mb-4">{panelLabel}</p>}
          <h1 className="font-display font-bold text-4xl leading-[1.1] tracking-tight">{panelTitle}</h1>
          {panelBullets.length > 0 && (
            <div className="mt-8 space-y-3 font-mono text-[13px] text-[#8A8A8F]">
              {panelBullets.map((b) => (
                <div key={b} className="flex items-center gap-2.5">
                  <span className="text-brand-400">$</span> {b}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="relative font-mono text-[12px] text-[#5A5A60]">{t('authPage.panelFoot')}</p>
      </aside>

      {/* ПРАВО — светлая форма */}
      <main className="flex-1 flex flex-col">
        {/* моб. лого */}
        <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-[#EAECEF]">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-brand-500" />
            <span className="font-mono text-sm font-semibold text-[#0F172A]">Diklario</span>
          </Link>
          <Link to="/" className="text-sm text-[#64748B] hover:text-[#0F172A]">{t('authPage.backHome')}</Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  )
}
