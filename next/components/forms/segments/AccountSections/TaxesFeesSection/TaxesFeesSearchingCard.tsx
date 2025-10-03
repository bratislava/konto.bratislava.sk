import MestskeKontoSituacia from '@assets/images/mestske-konto-situacia.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

const TaxesFeesSearchingCard = () => {
  const { t } = useTranslation('account')

  const content = `
  <h3>${t('account_section_payment.searching_card_title')}</h3>
  <div>${t('account_section_payment.searching_card_text')}</div>
  `

  return (
    <div className="flex w-full max-w-(--breakpoint-lg) flex-col justify-around rounded-lg border-2 border-gray-200 lg:flex-row">
      <div className="flex w-full flex-1 p-4 lg:p-12">
        <AccountMarkdown
          className="flex max-w-none flex-col justify-center md:mt-0 lg:max-w-[528px]"
          content={content}
        />
      </div>
      <span className="flex flex-1 justify-center">
        <MestskeKontoSituacia className="h-[140px] w-[145px] sm:h-[256px] sm:w-[608px]" />
      </span>
    </div>
  )
}

export default TaxesFeesSearchingCard
