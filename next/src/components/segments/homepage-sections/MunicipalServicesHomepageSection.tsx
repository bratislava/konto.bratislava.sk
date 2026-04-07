import { useTranslation } from 'next-i18next'

import { MunicipalServiceCardEntityFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import MunicipalServiceCard from '@/src/components/segments/MunicipalServiceCard/MunicipalServiceCard'
import ResponsiveCarousel from '@/src/components/simple-components/Carousel/ResponsiveCarousel'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  services: MunicipalServiceCardEntityFragment[]
}

const MunicipalServicesHomepageSection = ({ services }: Props) => {
  const { t } = useTranslation('account')

  return (
    <SectionContainer className="py-6 lg:py-18">
      <div className="flex flex-col gap-6 lg:gap-10">
        <SectionHeader
          title={t('account_section_services.navigation')}
          titleLevel="h2"
          showMoreLink={{
            href: ROUTES.MUNICIPAL_SERVICES,
            children: t('account_section_intro.all_services'),
          }}
        />
        <ResponsiveCarousel
          desktop={4}
          items={services.map((service) => (
            <MunicipalServiceCard key={service.documentId} service={service} />
          ))}
          hasVerticalPadding={false}
          className="-mx-2 px-2"
        />
      </div>
    </SectionContainer>
  )
}

export default MunicipalServicesHomepageSection
