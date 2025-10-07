import ImageMestskeKontoSituacia from '@assets/images/mestske-konto-situacia.png'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

const TaxesFeesErrorCard = () => {
  const { t } = useTranslation('account')

  const content = `
  <h4>${t('account_section_payment.error_card_title')}</h4>
  <div>${t('account_section_payment.error_card_content.title')}
  <ul>${t('account_section_payment.error_card_content.list.other')}</ul><br /></div>
  `

  return (
    <div className="flex w-full max-w-(--breakpoint-lg) flex-col justify-around rounded-lg border-2 border-gray-200 lg:flex-row">
      <div className="flex w-full flex-1 p-4 lg:p-12">
        <AccountMarkdown
          className="flex max-w-none flex-col justify-center md:mt-0 lg:max-w-[528px]"
          content={content}
        />
      </div>
      <span className="flex flex-1 items-center justify-center">
        <Image src={ImageMestskeKontoSituacia} alt="" className="object-contain" />
      </span>
    </div>
  )
}

export default TaxesFeesErrorCard
