import BannerPhone from '@assets/images/help-page-banner-image.png'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Banner from 'components/forms/simple-components/Banner'
import { useTranslation } from 'next-i18next'

import AccordionV2 from '../../../simple-components/AccordionV2'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

const HelpSection = () => {
  const { t } = useTranslation('account')

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_help.banner_content',
  )}</span>`

  const questions = Array.from({ length: 28 }, (_, i) => i + 1).map((i) => ({
    question: t(`account_section_help.faq.${i}.question`),
    answer: t(`account_section_help.faq.${i}.answer`),
  }))

  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_help.navigation')} />
      <div className="mx-auto w-full max-w-screen-lg py-6 lg:py-16">
        <h2 className="text-h2 flex justify-start px-4 lg:px-0">
          {t('account_section_help.faq.title')}
        </h2>
        <div className="flex flex-col gap-2 px-4 md:gap-3 lg:px-0">
          <h3 className="text-h4 mt-6 flex justify-start">
            {t('account_section_help.faq.general_category')}
          </h3>
          {questions.map((question, index) => (
            <AccordionV2 key={index} title={question.question}>
              <AccountMarkdown content={question.answer} />
            </AccordionV2>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 py-0 lg:py-16">
        <Banner
          title="Nenašli ste odpoveď na vašu otázku?"
          content={bannerContent}
          buttonText={t('account_section_help.banner_button_text')}
          href="mailto:info@bratislava.sk"
          image={BannerPhone}
        />
      </div>
    </div>
  )
}

export default HelpSection
