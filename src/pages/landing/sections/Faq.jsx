import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Вопросы «с улицы» — про саму платформу, до регистрации.
export default function Faq() {
  const { t } = useTranslation('landing')
  const [open, setOpen] = useState(0)
  const ITEMS = [1, 2, 3, 4, 5, 6, 7].map((i) => ({ q: t(`faq.q${i}`), a: t(`faq.a${i}`) }))
  return (
    <section id="faq" className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="mono-label mb-3">{t('faq.label')}</p>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight mb-3">{t('faq.title')}</h2>
        <p className="text-[#8A8A8F] mb-10">{t('faq.subtitle')}</p>

        <div className="divide-y divide-[#1E1E22] border-y border-[#1E1E22]">
          {ITEMS.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer group"
                >
                  <span className="flex gap-3">
                    <span className="font-mono text-[12px] text-[#3A3A40] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-[#EDEDED] group-hover:text-white">{it.q}</span>
                  </span>
                  <span className={`font-mono text-[#5A5A60] shrink-0 transition-transform ${isOpen ? 'rotate-45 text-brand-400' : ''}`}>+</span>
                </button>
                {isOpen && <p className="pb-5 pl-8 -mt-1 text-sm text-[#9A9AA1] leading-relaxed">{it.a}</p>}
              </div>
            )
          })}
        </div>

        <div className="mt-10 rounded-xl border border-[#1E1E22] bg-[#0D0D0F] p-5 flex items-center gap-3">
          <span className="font-mono text-brand-400">?</span>
          <p className="text-sm text-[#8A8A8F]">{t('faq.note')}</p>
        </div>
      </div>
    </section>
  )
}
