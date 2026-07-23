import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../../../components/ui/Logo'

// Футер лендинга — тёмный тех-моно.
export default function Footer({ onPrimary }) {
  const { t } = useTranslation('landing')
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <footer className="bg-[#18181C] text-[#EDEDED] border-t border-[#303036]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Logo size={22} />
              <span className="font-mono text-sm font-semibold">Diklaro</span>
            </div>
            <p className="text-sm text-[#6E6E76] max-w-xs">{t('footer.tagline')}</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[13px] text-[#8A8A8F]">
            <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors cursor-pointer">{t('footer.features')}</button>
            <button onClick={() => scrollTo('how')}      className="hover:text-white transition-colors cursor-pointer">{t('footer.how')}</button>
            <button onClick={() => scrollTo('faq')}       className="hover:text-white transition-colors cursor-pointer">{t('footer.faq')}</button>
            <Link to="/support"                            className="hover:text-white transition-colors cursor-pointer">{t('footer.support')}</Link>
            <button onClick={onPrimary}                    className="hover:text-white transition-colors cursor-pointer">{t('footer.start')}</button>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-[#26262B] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[12px] text-[#5A5A60]">
          <span>© {new Date().getFullYear()} Diklaro</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy', 'конфиденциальность')}</Link>
            <Link to="/terms"   className="hover:text-white transition-colors">{t('footer.terms', 'условия')}</Link>
            <span className="hidden sm:inline text-[#48484F]">·</span>
            <span>{t('footer.madeFor')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
