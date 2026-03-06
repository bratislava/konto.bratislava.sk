import { useTranslation } from 'next-i18next'

import Icon from '@/src/assets/images/mestske-konto-situacia-2-1.svg'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'

const MyApplicationCardsPlaceholder = () => {
  const { t } = useTranslation('account')

  return (
    <SectionContainer>
      <div className="-mx-4 mt-0 flex flex-col justify-around rounded-lg border-0 border-gray-200 pt-0 lg:-mx-8 lg:flex-row lg:border-2">
        <div className="flex justify-center">
          <Icon className="h-[145px] w-[146px] sm:h-[296px] sm:w-[298px]" />
        </div>
        <div className="mt-5 flex max-w-none flex-col justify-center gap-3 md:mt-0 lg:max-w-[500px]">
          <p className="text-h4">{t('account_section_applications.placeholder.title')}</p>
          <AccountMarkdown content={t('account_section_applications.placeholder.subtitle')} />
        </div>
      </div>
    </SectionContainer>
  )
}

export default MyApplicationCardsPlaceholder
