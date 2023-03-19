import { useTranslation } from 'next-i18next'

import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

const TaxFooter = () => {
  const { t } = useTranslation('account')
  return (
    <>
      <AccountMarkdown content={t('tax_footer.first')} />
      <AccountMarkdown content={t('tax_footer.second')} />
    </>
  )
}

export default TaxFooter
