import ImageMesto from '@assets/images/mestske-konto-situacia.png'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

const TaxesFeesErrorCard = () => {
  const { t } = useTranslation('account')

  const content = `
  <h3>${t('account_section_payment.error_card_title')}</h3>
  <div>${t('account_section_payment.error_card_content.title')}
  <ul>${t('account_section_payment.error_card_content.list.other')}</ul><br /></div>
  `

  return (
    <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col rounded-lg border-0 border-gray-200 px-4 pt-0 lg:flex-row lg:border-2 lg:px-0">
      <AccountMarkdown
        className="mt-6 flex w-full max-w-none flex-col justify-center md:mt-0 lg:gap-2 lg:p-12"
        content={content}
      />
      <span className="relative w-full">
        <Image src={ImageMesto} alt="" fill className="object-cover" />
      </span>
    </div>
  )
}

export default TaxesFeesErrorCard
