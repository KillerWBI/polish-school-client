import { useTranslation } from 'react-i18next'

// Секция лендинга «для учеников» — снизу, с переходом на регистрацию ученика.
export default function ForStudents({ onStudentLanding, onLogin }) {
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation('common')
  return (
    <section id="students" className="bg-[#0D0D0F] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <p className="mono-label mb-4">{t('forStudents.label')}</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight max-w-2xl">
          {t('forStudents.title')}
        </h2>
        <p className="mt-4 text-[#8A8A8F] max-w-xl leading-relaxed">
          {t('forStudents.text')}
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-lg font-mono text-[13px] text-[#8A8A8F]">
          {[t('forStudents.f1'), t('forStudents.f2'), t('forStudents.f3'), t('forStudents.f4')].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="text-brand-400">$</span> {item}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={onStudentLanding}
            className="h-11 px-6 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors cursor-pointer">
            {t('forStudents.cta')}
          </button>
          <button onClick={onLogin}
            className="h-11 px-6 rounded-lg border border-[#2A2A2E] text-[#EDEDED] text-sm hover:bg-white/[0.04] hover:border-[#3A3A40] transition-colors cursor-pointer">
            {tc('login')}
          </button>
        </div>

        <p className="mt-6 font-mono text-[12px] text-[#5A5A60]">
          {t('forStudents.teacherNote')}
        </p>
      </div>
    </section>
  )
}
