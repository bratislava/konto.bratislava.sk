import Icon from '@assets/images/mestske-konto-situacia-2-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'
import { useQueryParamRedirect } from '../../../../../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'

const TaxesFeesErrorCard = () => {
  const { t } = useTranslation('account')
  const { tierStatus } = useSsrAuth()
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()

  const content = `
  <h3>${t('account_section_payment.error_card_title')}</h3>
  <div>${t('account_section_payment.error_card_content.title')}
  <ul>${
    tierStatus.isIdentityVerified
      ? ''
      : t('account_section_payment.error_card_content.list.verification', {
          url: getRouteWithCurrentUrlRedirect(ROUTES.IDENTITY_VERIFICATION),
        })
  }${t('account_section_payment.error_card_content.list.other')}</ul><br />${t(
    'account_section_payment.error_card_content.help_text',
    { url: ROUTES.HELP },
  )}</div>
  `

  return (
    <div className="max-w-(--breakpoint-lg) m-auto flex w-full flex-col justify-around rounded-lg border-0 border-gray-200 px-4 pt-0 md:px-16 lg:flex-row lg:border-2 lg:py-10">
      <span className="flex justify-center">
        <Icon className="h-[140px] w-[145px] sm:h-[296px] sm:w-[308px]" />
      </span>
      <AccountMarkdown
        className="mt-6 flex max-w-none flex-col justify-center md:mt-0 lg:max-w-[528px]"
        content={content}
      />
    </div>
  )
}

export default TaxesFeesErrorCard
