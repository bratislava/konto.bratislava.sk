import { useTranslation } from 'next-i18next'

const TaxFooter = () => {
  const { t } = useTranslation('forms')
  return (
    <>
      <div className="lg:text-20 text-16 md:px-16 lg:px-0 px-0 max-w-screen-lg m-auto md:whitespace-normal whitespace-pre-line">
        {t('tax_footer.register_ba')}
        <div className="font-semibold inline">{t('tax_footer.register_ba_to')}</div>
        {t('tax_footer.pay_tax_online')}
        <div className="font-semibold inline">{t('tax_footer.pay_tax_online_to')}</div>
        {t('tax_footer.accept_terms')}
      </div>
      <div className="lg:text-20 text-16 lg:px-0 px-0 md:whitespace-normal whitespace-pre-line mt-2">
        <div className="inline">{t('tax_footer.maybe_questions')}</div>
        <div className="inline">{t('tax_footer.see_answers')}</div>
        <a
          href="https://bratislava-next.staging.bratislava.sk/account/i-have-a-problem"
          className="underline underline-offset-4"
        >
          {t('tax_footer.frequently_asked')}
        </a>
        {'\n\n'}
        <div>
          {t('tax_footer.contact_us_at')}{' '}
          <a
            href={`mailto:${t('tax_footer.mail_to_contact')}`}
            className="lg:text-20-medium text-16-medium underline-offset-4 underline"
          >
            {t('tax_footer.mail_to_contact')}
          </a>
        </div>
      </div>
    </>
  )
}

export default TaxFooter
