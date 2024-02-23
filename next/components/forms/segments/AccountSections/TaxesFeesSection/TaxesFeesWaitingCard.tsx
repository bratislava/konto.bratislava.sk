import Icon from '@assets/images/mestske-konto-situacia-1-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

type TaxesFeesWaitingCardBase = {
  content?: string
}

const TaxesFeesWaitingCard = ({ content }: TaxesFeesWaitingCardBase) => {
  const { t } = useTranslation('account')
  return (
    <div className="flex flex-col gap-6">
      <div className="m-auto mt-0 flex w-full max-w-screen-lg flex-col justify-around rounded-lg border-0 border-gray-200 px-4 pt-5 md:px-16 lg:mt-8 lg:flex-row lg:border-2 lg:py-10">
        <div className="flex justify-center">
          <Icon className="h-[145px] w-[146px] sm:h-[296px] sm:w-[298px]" />
        </div>
        <AccountMarkdown
          className="mt-5 flex max-w-none flex-col justify-center md:mt-0 lg:max-w-[528px]"
          content={content}
        />
      </div>
      <div className="block px-4 md:hidden">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div className="text-p2 m-auto max-w-screen-lg whitespace-pre-line px-4 md:whitespace-normal md:px-16 lg:px-0">
        <AccountMarkdown variant="sm" content={t('tax_footer.register_info')} />
      </div>
    </div>
  )
}

export default TaxesFeesWaitingCard
