import BannerPhone from '@assets/images/help-page-banner-image.png'
import { HelpPageFragment } from '@clients/graphql-strapi/api'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Banner from 'components/forms/simple-components/Banner'
import { useTranslation } from 'next-i18next'

import { isDefined } from '../../../../../frontend/utils/general'
import AccordionV2 from '../../../simple-components/AccordionV2'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

type HelpSectionProps = {
  helpPage: HelpPageFragment
}

const HelpSection = ({ helpPage }: HelpSectionProps) => {
  const { t } = useTranslation('account')

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_help.banner_content',
  )}</span>`

  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_help.navigation')} />
      <div className="mx-auto w-full max-w-(--breakpoint-lg) py-6 lg:py-16">
        <h2 className="flex justify-start px-4 text-h2 lg:px-0">
          {t('account_section_help.faq.title')}
        </h2>
        <div className="flex flex-col gap-2 px-4 md:gap-3 lg:px-0">
          {helpPage.categories.filter(isDefined).map((category) => (
            <div className="flex flex-col gap-2 md:gap-3" key={category.id}>
              <h3 className="mt-6 flex justify-start text-h4">{category.title}</h3>
              {category.items.filter(isDefined).map((item, index) => (
                <AccordionV2 key={index} title={item.title}>
                  <AccountMarkdown content={item.content} />
                </AccordionV2>
              ))}
            </div>
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
