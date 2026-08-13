import { useTranslation } from 'react-i18next'
import { IconArrow } from '../../../components/ui/icons'

// Последний экран перед футером: одна кнопка, ничего лишнего.
export default function FinalCta({ onPrimary }) {
  const { t } = useTranslation('landing')

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-teal-500 px-6 sm:px-12 py-16 sm:py-20 text-center">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="blob absolute -top-24 -left-16 w-80 h-80 bg-white/10" />
            <div className="blob-b absolute -bottom-28 -right-10 w-96 h-96 bg-white/10" />
          </div>

          <div className="relative">
            <h2 className="font-display font-bold text-white text-3xl sm:text-[2.7rem] leading-[1.12] tracking-tight max-w-2xl mx-auto">
              {t('finalCta.title')}
            </h2>
            <p className="mt-4 text-white/85 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              {t('finalCta.text')}
            </p>
            <button
              onClick={onPrimary}
              className="mt-9 inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-white text-teal-700 text-[15px] font-semibold hover:bg-teal-50 transition-colors cursor-pointer shadow-[0_14px_30px_-14px_rgba(0,0,0,0.4)]"
            >
              {t('finalCta.cta')}
              <IconArrow size={18} strokeWidth={2.2} />
            </button>
            <p className="mt-5 text-[13px] text-white/70">{t('finalCta.note')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
