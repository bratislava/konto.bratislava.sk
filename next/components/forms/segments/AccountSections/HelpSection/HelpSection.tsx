import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Accordion from 'components/forms/simple-components/Accordion'
import Banner from 'components/forms/simple-components/Banner'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const HelpSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_help.banner_content',
  )}</span>`
  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_help.navigation')} />
      <div className="w-full max-w-screen-lg mx-auto">
        <h2 className="text-h2 justify-center hidden md:flex mt-8">Často kladené otázky</h2>
        <div className="flex flex-col gap-2 md:gap-3 px-4 lg:px-0 my-4 md:my-6">
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
        </div>
      </div>
      <div className="bg-gray-50 py-0 lg:py-16">
        <Banner
          title="Nenašli ste odpoveď na vašu otázku?"
          content={bannerContent}
          buttonText={t('account_section_help.banner_button_text')}
          onPress={() => router.push('mailto:info@bratislava.sk ')}
        />
      </div>
    </div>
  )
}

export default HelpSection
