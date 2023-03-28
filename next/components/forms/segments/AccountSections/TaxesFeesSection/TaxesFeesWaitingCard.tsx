import Icon from '@assets/images/account/mestske-konto-situacia-1-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

type TaxesFeesWaitingCardBase = {
  content?: string
}

const TaxesFeesWaitingCard = ({ content }: TaxesFeesWaitingCardBase) => {
  const { t } = useTranslation('account')
  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-screen-lg m-auto mt-0 lg:mt-8 px-4 md:px-16 pt-5 lg:py-10 flex flex-col lg:flex-row justify-around border-0 lg:border-2 border-gray-200 rounded-lg">
        <div className="flex justify-center">
          <Icon className="w-[146px] h-[145px] sm:w-[298px] sm:h-[296px]" />
        </div>
        <AccountMarkdown
          className="flex flex-col justify-center max-w-none lg:max-w-[500px] mt-5 md:mt-0"
          content={content}
        />
      </div>
      <div className="md:hidden block px-4">
        <div className="w-full h-0.5 bg-gray-200" />
      </div>
      <div className="text-p2 md:px-16 lg:px-0 px-4 max-w-screen-lg m-auto md:whitespace-normal whitespace-pre-line">
        <AccountMarkdown variant="sm" content={t('tax_footer.register_info')} />
      </div>
    </div>
  )
}

export default TaxesFeesWaitingCard
