import Icon from '@assets/images/account/mestske-konto-situacia-2-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

const MyApplicationCardsPlaceholder = () => {
  const { t } = useTranslation('account')
  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-screen-lg m-auto mt-0 lg:mt-8 px-0 md:px-16 pt-0 lg:py-10 flex flex-col lg:flex-row justify-around border-0 lg:border-2 border-gray-200 rounded-lg">
        <div className="flex justify-center">
          <Icon className="w-[146px] h-[145px] sm:w-[298px] sm:h-[296px]" />
        </div>
        <div className="flex flex-col gap-3 justify-center max-w-none lg:max-w-[500px] mt-5 md:mt-0">
          <p className="text-h4">{t('account_section_applications.placeholder.title')}</p>
          <AccountMarkdown content={t('account_section_applications.placeholder.subtitle')} />
        </div>
      </div>
    </div>
  )
}

export default MyApplicationCardsPlaceholder
