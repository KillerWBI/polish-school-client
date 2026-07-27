import { useTranslation } from 'react-i18next'
import LegalLayout, { LegalSection } from './LegalLayout'

// Политика конфиденциальности (GDPR-ориентированная). Текст — из legal.json (ru/en/pl/uk).
export default function PrivacyPage() {
  const { t } = useTranslation('legal')
  const arr = (key) => t(`privacy.${key}`, { returnObjects: true })

  return (
    <LegalLayout title={t('privacy.title')} updated={t('updated')}>
      <p>{t('privacy.intro')}</p>

      <LegalSection n="1" title={t('privacy.s1t')}>
        <ul className="list-disc pl-5 space-y-1">
          {arr('s1').map((li, i) => <li key={i}>{li}</li>)}
        </ul>
      </LegalSection>

      <LegalSection n="2" title={t('privacy.s2t')}>
        {arr('s2').map((p, i) => <p key={i}>{p}</p>)}
      </LegalSection>

      <LegalSection n="3" title={t('privacy.s3t')}>
        <p>{t('privacy.s3lead')}</p>
        <ul className="list-disc pl-5 space-y-1">
          {arr('s3').map((li, i) => <li key={i}>{li}</li>)}
        </ul>
        <p>{t('privacy.s3end')}</p>
      </LegalSection>

      <LegalSection n="4" title={t('privacy.s4t')}><p>{t('privacy.s4')}</p></LegalSection>
      <LegalSection n="5" title={t('privacy.s5t')}><p>{t('privacy.s5')}</p></LegalSection>
      <LegalSection n="6" title={t('privacy.s6t')}><p>{t('privacy.s6')}</p></LegalSection>

      <LegalSection n="7" title={t('privacy.s7t')}>
        {arr('s7').map((p, i) => <p key={i}>{p}</p>)}
      </LegalSection>

      <LegalSection n="8" title={t('privacy.s8t')}><p>{t('privacy.s8')}</p></LegalSection>
      <LegalSection n="9" title={t('privacy.s9t')}><p>{t('privacy.s9')}</p></LegalSection>
      <LegalSection n="10" title={t('privacy.s10t')}><p>{t('privacy.s10')}</p></LegalSection>
      <LegalSection n="11" title={t('privacy.s11t')}><p>{t('privacy.s11')}</p></LegalSection>
    </LegalLayout>
  )
}
