import Icon from '@assets/images/mestske-konto-situacia-2-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

const MyApplicationCardsPlaceholder = () => {
  const { t } = useTranslation('account')

  return (
    <div className="flex flex-col gap-6">
      <div className="m-auto mt-0 flex w-full max-w-screen-lg flex-col justify-around rounded-lg border-0 border-gray-200 px-0 pt-0 md:px-16 lg:mt-8 lg:flex-row lg:border-2 lg:py-10">
        <div className="flex justify-center">
          <Icon className="h-[145px] w-[146px] sm:h-[296px] sm:w-[298px]" />
        </div>
        <div className="mt-5 flex max-w-none flex-col justify-center gap-3 md:mt-0 lg:max-w-[500px]">
          <p className="text-h4">{t('account_section_applications.placeholder.title')}</p>
          <AccountMarkdown content={t('account_section_applications.placeholder.subtitle')} />
        </div>
      </div>
    </div>
  )
}

export default MyApplicationCardsPlaceholder
