import { useTranslation } from 'next-i18next/pages'

import BannerPhone from '@/src/assets/images/help-page-banner-image.png'
import { HelpPageFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import FaqsGroup from '@/src/components/segments/FaqsGroup/FaqsGroup'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
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

  return (
    <>
      <PageHeader title={t('account_section_help.navigation')} />
      <div className="flex flex-col">
        {helpPage.categories.filter(isDefined).map((category) => (
          <SectionContainer className="lg:pt-18 lg:last:pb-18 pt-6 last:pb-6" key={category.id}>
            <div className="flex flex-col gap-6 lg:gap-8">
              <SectionHeader title={category.title} titleLevel="h2" />
              <FaqsGroup
                faqs={category.items.filter(isDefined).map((faq) => ({
                  title: faq.title,
                  content: faq.content,
                }))}
                accordionTitleLevel="h3"
              />
            </div>
          </SectionContainer>
        ))}
      </div>
      <SectionContainer className="bg-background-passive-primary lg:py-18 py-6">
        <Banner
          title="Nenašli ste odpoveď na vašu otázku?"
          content={`<span className='text-p2'>${t('account_section_help.banner_content')}</span>`}
          buttonText={t('account_section_help.banner_button_text')}
          href="mailto:info@bratislava.sk"
          image={BannerPhone}
        />
      </SectionContainer>
    </>
  )
}

export default HelpPageContent
