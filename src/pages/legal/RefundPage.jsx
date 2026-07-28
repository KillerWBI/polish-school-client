import { useTranslation } from 'react-i18next'
import LegalLayout, { LegalSection } from './LegalLayout'

// Политика возврата средств. Текст — из legal.json (ru/en/pl/uk).
// Требование Paddle: публичная страница возвратов до одобрения аккаунта.
export default function RefundPage() {
  const { t } = useTranslation('legal')
  const arr = (key) => t(`refund.${key}`, { returnObjects: true })

  return (
    <LegalLayout title={t('refund.title')} updated={t('updated')}>
      <p>{t('refund.intro')}</p>

      <LegalSection n="1" title={t('refund.s1t')}><p>{t('refund.s1')}</p></LegalSection>
      <LegalSection n="2" title={t('refund.s2t')}><p>{t('refund.s2')}</p></LegalSection>
      <LegalSection n="3" title={t('refund.s3t')}><p>{t('refund.s3')}</p></LegalSection>
      <LegalSection n="4" title={t('refund.s4t')}><p>{t('refund.s4')}</p></LegalSection>

      <LegalSection n="5" title={t('refund.s5t')}>
        <ul className="list-disc pl-5 space-y-1">
          {arr('s5').map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </LegalSection>

      <LegalSection n="6" title={t('refund.s6t')}><p>{t('refund.s6')}</p></LegalSection>
      <LegalSection n="7" title={t('refund.s7t')}><p>{t('refund.s7')}</p></LegalSection>
      <LegalSection n="8" title={t('refund.s8t')}><p>{t('refund.s8')}</p></LegalSection>
    </LegalLayout>
  )
}
