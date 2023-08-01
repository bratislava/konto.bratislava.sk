import BannerPhone from '@assets/images/help-page-banner-image.png'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Accordion from 'components/forms/simple-components/Accordion'
import Banner from 'components/forms/simple-components/Banner'
import { useTranslation } from 'next-i18next'

const HelpSection = () => {
  const { t } = useTranslation('account')

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_help.banner_content',
  )}</span>`

  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_help.navigation')} />
      <div className="mx-auto w-full max-w-screen-lg py-6 lg:py-16">
        <h2 className="text-h2 flex justify-start px-4 lg:px-0">
          {t('account_section_help.faq.title')}
        </h2>
        <div className="flex flex-col gap-2 px-4 md:gap-3 lg:px-0">
          <h4 className="text-h4 mt-6 flex justify-start">
            {t('account_section_help.faq.general_category')}
          </h4>
          <Accordion
            title={t('account_section_help.faq.1.question')}
            size="md"
            content={t('account_section_help.faq.1.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.2.question')}
            size="md"
            content={t('account_section_help.faq.2.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.3.question')}
            size="md"
            content={t('account_section_help.faq.3.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.4.question')}
            size="md"
            content={t('account_section_help.faq.4.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.5.question')}
            size="md"
            content={t('account_section_help.faq.5.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.6.question')}
            size="md"
            content={t('account_section_help.faq.6.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.7.question')}
            size="md"
            content={t('account_section_help.faq.7.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.28.question')}
            size="md"
            content={t('account_section_help.faq.28.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.8.question')}
            size="md"
            content={t('account_section_help.faq.8.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.9.question')}
            size="md"
            content={t('account_section_help.faq.9.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.10.question')}
            size="md"
            content={t('account_section_help.faq.10.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.11.question')}
            size="md"
            content={t('account_section_help.faq.11.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.12.question')}
            size="md"
            content={t('account_section_help.faq.12.answer')}
          />
          <h4 className="text-h4 mt-6 flex justify-start lg:mt-12">
            {t('account_section_help.faq.taxes_category')}
          </h4>
          <Accordion
            title={t('account_section_help.faq.13.question')}
            size="md"
            content={t('account_section_help.faq.13.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.14.question')}
            size="md"
            content={t('account_section_help.faq.14.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.15.question')}
            size="md"
            content={t('account_section_help.faq.15.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.16.question')}
            size="md"
            content={t('account_section_help.faq.16.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.17.question')}
            size="md"
            content={t('account_section_help.faq.17.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.18.question')}
            size="md"
            content={t('account_section_help.faq.18.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.19.question')}
            size="md"
            content={t('account_section_help.faq.19.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.20.question')}
            size="md"
            content={t('account_section_help.faq.20.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.21.question')}
            size="md"
            content={t('account_section_help.faq.21.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.22.question')}
            size="md"
            content={t('account_section_help.faq.22.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.23.question')}
            size="md"
            content={t('account_section_help.faq.23.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.24.question')}
            size="md"
            content={t('account_section_help.faq.24.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.25.question')}
            size="md"
            content={t('account_section_help.faq.25.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.26.question')}
            size="md"
            content={t('account_section_help.faq.26.answer')}
          />
          <Accordion
            title={t('account_section_help.faq.27.question')}
            size="md"
            content={t('account_section_help.faq.27.answer')}
          />
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
