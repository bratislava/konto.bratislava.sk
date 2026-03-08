import { useTranslation } from 'next-i18next'

import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import MunicipalServiceCard from '@/src/components/segments/MunicipalServiceCard/MunicipalServiceCard'
import Button from '@/src/components/simple-components/Button'
import ResponsiveCarousel from '@/src/components/simple-components/Carousel/ResponsiveCarousel'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  services: MunicipalServiceEntityFragment[]
}

const MunicipalServicesHomepageSection = ({ services }: Props) => {
  const { t } = useTranslation('account')

  return (
    <SectionContainer className="py-6 lg:py-18">
      <div className="flex flex-col gap-6">
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-h2">{t('account_section_services.navigation')}</h2>
          <Button variant="link" href={ROUTES.MUNICIPAL_SERVICES}>
            {t('account_section_intro.all_services')}
          </Button>
        </div>
        <ResponsiveCarousel
          desktop={4}
          items={services.map((service) => (
            <MunicipalServiceCard key={service.id} service={service} />
          ))}
          hasVerticalPadding={false}
          className="-mx-2 px-2"
        />
      </div>
    </SectionContainer>
  )
}

export default MunicipalServicesHomepageSection
