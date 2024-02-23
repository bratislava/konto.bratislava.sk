import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'

const TaxFooter = () => {
  const { t } = useTranslation('account')
  return (
    <>
      <div className="my-4 block h-0.5 w-full bg-gray-200 md:hidden" />
      <AccountMarkdown content={t('tax_footer.register_info')} className="mb-3 md:mb-0" />
      <AccountMarkdown content={t('tax_footer.register_info_help', { url: ROUTES.HELP })} />
    </>
  )
}

export default TaxFooter
