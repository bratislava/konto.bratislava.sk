import Icon from '@assets/images/mestske-konto-situacia-2-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

const TaxesFeesSearchingCard = () => {
  const { t } = useTranslation('account')

  const content = `
  <h3>${t('account_section_payment.searching_card_title')}</h3>
  <div>${t('account_section_payment.searching_card_text')}</div>
  `

  return (
    <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col justify-around rounded-lg border-0 border-gray-200 px-4 pt-0 md:px-16 lg:flex-row lg:border-2 lg:py-10">
      <AccountMarkdown
        className="mt-6 flex max-w-none flex-col justify-center md:mt-0 lg:max-w-[528px]"
        content={content}
      />
      <span className="flex justify-center">
        <Icon className="h-[140px] w-[145px] sm:h-[296px] sm:w-[308px]" />
      </span>
    </div>
  )
}

export default TaxesFeesSearchingCard
