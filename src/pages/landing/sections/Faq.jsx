import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconHelp } from '../../../components/ui/icons'

// Вопросы «с улицы» — про саму платформу, до регистрации.
export default function Faq() {
  const { t } = useTranslation('landing')
  const [open, setOpen] = useState(0)
  const ITEMS = [1, 2, 3, 4, 5, 6, 7].map(i => ({ q: t(`faq.q${i}`), a: t(`faq.a${i}`) }))

  return (
    <section id="faq" className="bg-[#F7FAFB]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center">
          <p className="eyebrow mb-3">{t('faq.label')}</p>
          <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight mb-3">{t('faq.title')}</h2>
          <p className="text-[#5A6B7C]">{t('faq.subtitle')}</p>
        </div>

        <div className="mt-12 space-y-3">
          {ITEMS.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={it.q} className="soft-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 text-left cursor-pointer"
                >
                  <span className="font-semibold text-[15px] text-[#0E1726]">{it.q}</span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center text-lg leading-none transition-transform ${
                      isOpen ? 'rotate-45 bg-teal-500 text-white' : 'bg-[#F1F5F6] text-[#5A6B7C]'
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 sm:px-6 pb-5 -mt-1 text-[15px] text-[#5A6B7C] leading-relaxed">{it.a}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-10 rounded-2xl bg-teal-50 border border-teal-100 p-5 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-teal-500 text-white inline-flex items-center justify-center shrink-0">
            <IconHelp size={17} strokeWidth={2.2} />
          </span>
          <p className="text-[14px] text-[#17766F]">{t('faq.note')}</p>
        </div>
      </div>
    </section>
  )
}
