import { useTranslation } from 'next-i18next'

import BannerPhone from '@/src/assets/images/help-page-banner-image.png'
import { HelpPageFragment } from '@/src/clients/graphql-strapi/api'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
import AccordionV2 from '@/src/components/simple-components/AccordionV2'
import Banner from '@/src/components/simple-components/Banner'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  helpPage: HelpPageFragment
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95087
 */

const HelpPageContent = ({ helpPage }: Props) => {
  const { t } = useTranslation('account')

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_help.banner_content',
  )}</span>`

  return (
    <>
      <PageHeader title={t('account_section_help.navigation')} />
      <SectionContainer className="py-6 lg:py-16">
        <SectionHeader title={t('account_section_help.faq.title')} titleLevel="h2" />
        <div className="flex flex-col gap-2 md:gap-3">
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
      </SectionContainer>
      <SectionContainer className="bg-background-passive-primary py-6 lg:py-16">
        <Banner
          title="Nenašli ste odpoveď na vašu otázku?"
          content={bannerContent}
          buttonText={t('account_section_help.banner_button_text')}
          href="mailto:info@bratislava.sk"
          image={BannerPhone}
        />
      </SectionContainer>
    </>
  )
}

export default HelpPageContent
