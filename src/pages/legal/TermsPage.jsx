import { useTranslation } from 'react-i18next'
import LegalLayout, { LegalSection } from './LegalLayout'

// Условия использования. Текст — из legal.json (ru/en/pl/uk).
export default function TermsPage() {
  const { t } = useTranslation('legal')
  const arr = (key) => t(`terms.${key}`, { returnObjects: true })

  return (
    <LegalLayout title={t('terms.title')} updated={t('updated')}>
      <p>{t('terms.intro')}</p>

      <LegalSection n="1" title={t('terms.s1t')}><p>{t('terms.s1')}</p></LegalSection>
      <LegalSection n="2" title={t('terms.s2t')}><p>{t('terms.s2')}</p></LegalSection>

      <LegalSection n="3" title={t('terms.s3t')}>
        {arr('s3').map((p, i) => <p key={i}>{p}</p>)}
      </LegalSection>

      <LegalSection n="4" title={t('terms.s4t')}>
        {arr('s4').map((p, i) => <p key={i}>{p}</p>)}
      </LegalSection>

      <LegalSection n="5" title={t('terms.s5t')}><p>{t('terms.s5')}</p></LegalSection>
      <LegalSection n="6" title={t('terms.s6t')}><p>{t('terms.s6')}</p></LegalSection>
      <LegalSection n="7" title={t('terms.s7t')}><p>{t('terms.s7')}</p></LegalSection>
      <LegalSection n="8" title={t('terms.s8t')}><p>{t('terms.s8')}</p></LegalSection>
      <LegalSection n="9" title={t('terms.s9t')}><p>{t('terms.s9')}</p></LegalSection>
      <LegalSection n="10" title={t('terms.s10t')}><p>{t('terms.s10')}</p></LegalSection>
      <LegalSection n="11" title={t('terms.s11t')}><p>{t('terms.s11')}</p></LegalSection>
      <LegalSection n="12" title={t('terms.s12t')}><p>{t('terms.s12')}</p></LegalSection>
      <LegalSection n="13" title={t('terms.s13t')}><p>{t('terms.s13')}</p></LegalSection>
      <LegalSection n="14" title={t('terms.s14t')}><p>{t('terms.s14')}</p></LegalSection>
    </LegalLayout>
  )
}
