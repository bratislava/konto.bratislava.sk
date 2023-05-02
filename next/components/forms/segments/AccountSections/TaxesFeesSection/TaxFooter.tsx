import { ROUTES } from '@utils/constants'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

const TaxFooter = () => {
  const { t } = useTranslation('account')
  return (
    <>
      <div className="md:hidden block w-full h-0.5 bg-gray-200 my-4" />
      <AccountMarkdown content={t('tax_footer.register_info')} className="mb-3 md:mb-0" />
      <AccountMarkdown content={t('tax_footer.register_info_help', { url: ROUTES.HELP })} />
    </>
  )
}

export default TaxFooter
