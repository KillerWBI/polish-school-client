import { useTranslation } from 'react-i18next'
import { PrimaryButton, GhostButton, Check } from './_kit'

// Секция «для учеников» — бирюзовая полоса, визуальная пауза между
// разворотами продукта и тарифами.
export default function ForStudents({ onStudentLanding, onLogin }) {
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation('common')

  return (
    <section id="students" className="relative bg-teal-50 overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="blob absolute -top-24 -left-16 w-80 h-80 bg-teal-100" />
        <div className="blob-b absolute -bottom-28 right-[-6%] w-96 h-96 bg-teal-200/50" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <div className="soft-card p-8 sm:p-12">
          <p className="eyebrow mb-3">{t('forStudents.label')}</p>
          <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight max-w-2xl leading-[1.15]">
            {t('forStudents.title')}
          </h2>
          <p className="mt-4 text-[#5A6B7C] text-base max-w-xl leading-relaxed">{t('forStudents.text')}</p>

          <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3.5 max-w-2xl">
            {[t('forStudents.f1'), t('forStudents.f2'), t('forStudents.f3'), t('forStudents.f4')].map(item => (
              <Check key={item}>{item}</Check>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <PrimaryButton onClick={onStudentLanding}>{t('forStudents.cta')}</PrimaryButton>
            <GhostButton onClick={onLogin}>{tc('login')}</GhostButton>
          </div>

          <p className="mt-6 text-[13px] text-[#8FA0AE]">{t('forStudents.teacherNote')}</p>
        </div>
      </div>
    </section>
  )
}
