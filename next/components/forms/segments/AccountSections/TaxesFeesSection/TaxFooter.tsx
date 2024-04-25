import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'

const TaxFooter = () => {
  const { t } = useTranslation('account')
  return (
    <div className="flex w-full flex-col px-4 lg:px-0">
      <AccountMarkdown content={t('tax_footer.register_info_help', { url: ROUTES.HELP })} />
    </div>
  )
}

export default TaxFooter
