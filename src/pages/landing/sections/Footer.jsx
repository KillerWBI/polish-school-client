import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../../../components/ui/Logo'

// Футер лендинга — светлый.
export default function Footer({ onPrimary }) {
  const { t } = useTranslation('landing')
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const link = 'hover:text-teal-700 transition-colors cursor-pointer'

  return (
    <footer className="bg-[#F7FAFB] border-t border-[#EDF1F4]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Logo size={26} />
              <span className="font-display text-[17px] font-bold text-[#0E1726] tracking-tight">Peravenor</span>
            </div>
            <p className="text-[14px] text-[#5A6B7C] max-w-xs leading-relaxed">{t('footer.tagline')}</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-[#5A6B7C]">
            <button onClick={() => scrollTo('features')} className={link}>{t('footer.features')}</button>
            <button onClick={() => scrollTo('how')}      className={link}>{t('footer.how')}</button>
            <button onClick={() => scrollTo('pricing')}  className={link}>{t('footer.pricing')}</button>
            <button onClick={() => scrollTo('faq')}      className={link}>{t('footer.faq')}</button>
            <Link to="/support"                          className={link}>{t('footer.support')}</Link>
            <button onClick={onPrimary}                  className={`${link} font-semibold text-teal-600`}>{t('footer.start')}</button>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E3E9ED] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#8FA0AE]">
          <span>© {new Date().getFullYear()} Peravenor</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link to="/privacy" className={link}>{t('footer.privacy')}</Link>
            <Link to="/terms"   className={link}>{t('footer.terms')}</Link>
            <Link to="/refund"  className={link}>{t('footer.refund')}</Link>
            <span className="hidden sm:inline text-[#C7D1D8]">·</span>
            <span>{t('footer.madeFor')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
