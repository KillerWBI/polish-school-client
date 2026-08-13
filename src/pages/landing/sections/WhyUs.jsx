import { useTranslation } from 'react-i18next'
import { IconStudents, IconMaterials, IconPayments, IconAI } from '../../../components/ui/icons'
import { SectionShell, SectionHead, IconTile } from './_kit'

// Четыре зоны, которые преподаватель держит под контролем. Обзор — здесь,
// разбор по шагам ниже, в «Что именно вы делаете внутри».
export default function WhyUs() {
  const { t } = useTranslation('landing')

  const cards = [
    { icon: IconStudents,  tone: 'mint',  k: 'c1' },
    { icon: IconMaterials, tone: 'lilac', k: 'c2' },
    { icon: IconPayments,  tone: 'peach', k: 'c3' },
    { icon: IconAI,        tone: 'amber', k: 'c4' },
  ]

  return (
    <SectionShell tone="alt">
      <SectionHead
        label={t('whyUs.label')}
        title={t('whyUs.title')}
        subtitle={t('whyUs.subtitle')}
      />

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ icon, tone, k }) => (
          <div key={k} className="soft-card p-6">
            <IconTile icon={icon} tone={tone} />
            <h3 className="mt-5 font-display font-bold text-[18px] text-[#0E1726] leading-snug">
              {t(`whyUs.${k}t`)}
            </h3>
            <p className="mt-2.5 text-[14px] text-[#5A6B7C] leading-relaxed">
              {t(`whyUs.${k}d`)}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
