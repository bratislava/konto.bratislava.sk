import {
  Enum_Componentblocksmunicipalservice_Color,
  Enum_Componentblocksmunicipalservice_Icon,
  MunicipalServicesPageFragment,
} from '@clients/graphql-strapi/api'
import MunicipalServicesSectionHeader from 'components/forms/segments/AccountSectionHeader/MunicipalServicesSectionHeader'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { ReactNode, useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

import AdministrationIcon from '../../../../../assets/icons/city-bratislava/city-administration.svg'
import PublicSpaceOccupationIcon from '../../../../../assets/icons/city-bratislava/public-space-occupation.svg'
import TaxesIcon from '../../../../../assets/icons/city-bratislava/taxes.svg'
import CulturalOrganizationIcon from '../../../../../assets/icons/culture-communities/cultural-organizations.svg'
import TheatreIcon from '../../../../../assets/icons/culture-communities/events-support.svg'
import LibraryIcon from '../../../../../assets/icons/culture-communities/library.svg'
import ZooIcon from '../../../../../assets/icons/culture-communities/zoo.svg'
import KidIcon from '../../../../../assets/icons/education-sport/kids-teenagers.svg'
import SwimmingPoolIcon from '../../../../../assets/icons/education-sport/swimming-pool.svg'
import GardensIcon from '../../../../../assets/icons/environment-construction/community-gardens.svg'
import SewerageIcon from '../../../../../assets/icons/environment-construction/connector.svg'
import FrontGardensIcon from '../../../../../assets/icons/environment-construction/front-gardens.svg'
import TreeIcon from '../../../../../assets/icons/environment-construction/greenery.svg'
import LampIcon from '../../../../../assets/icons/environment-construction/lamp.svg'
import SpatialPlanningIcon from '../../../../../assets/icons/environment-construction/spatial-planning.svg'
import BasketIcon from '../../../../../assets/icons/environment-construction/waste.svg'
import SecurityIcon from '../../../../../assets/icons/most-wanted-services/reporting-of-incentives.svg'
import MarianumIcon from '../../../../../assets/icons/other/marianum.svg'
import MosquitoIcon from '../../../../../assets/icons/other/mosquito-hunters.svg'
import ChristmasTreeIcon from '../../../../../assets/icons/other/tree.svg'
import HousingIcon from '../../../../../assets/icons/social-services/housing.svg'
import TransportIcon from '../../../../../assets/icons/transport-and-maps/city-​​transport.svg'
import ExcavationsIcon from '../../../../../assets/icons/transport-and-maps/excavations.svg'
import ManagmentCommunicationsIcon from '../../../../../assets/icons/transport-and-maps/management-communications.svg'
import ParkingIcon from '../../../../../assets/icons/transport-and-maps/parking.svg'
import TowIcon from '../../../../../assets/icons/transport-and-maps/towing.svg'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import { SelectOption } from '../../../widget-components/SelectField/SelectField'

type MunicipalServicesSectionProps = {
  municipalServicesPage: MunicipalServicesPageFragment
  categories: string[]
}

const getIconComponent = (
  iconName: Enum_Componentblocksmunicipalservice_Icon,
  color: Enum_Componentblocksmunicipalservice_Color,
): ReactNode => {
  const colorClassMap: Record<Enum_Componentblocksmunicipalservice_Color, string> = {
    [Enum_Componentblocksmunicipalservice_Color.Transport]: 'text-transport-700',
    [Enum_Componentblocksmunicipalservice_Color.Environment]: 'text-environment-700',
    [Enum_Componentblocksmunicipalservice_Color.Social]: 'text-social-600',
    [Enum_Componentblocksmunicipalservice_Color.Education]: 'text-education-600',
    [Enum_Componentblocksmunicipalservice_Color.Culture]: 'text-culture-700',
    [Enum_Componentblocksmunicipalservice_Color.Main]: 'text-main-600',
  } as const

  const colorClass = colorClassMap[color]
  const className = `size-10 ${colorClass} lg:size-12`

  const iconComponentMap: Record<Enum_Componentblocksmunicipalservice_Icon, ReactNode> = {
    [Enum_Componentblocksmunicipalservice_Icon.Administration]: (
      <AdministrationIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.PublicSpaceOccupation]: (
      <PublicSpaceOccupationIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Taxes]: <TaxesIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.CulturalOrganizations]: (
      <CulturalOrganizationIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.EventsSupport]: (
      <TheatreIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Library]: <LibraryIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Zoo]: <ZooIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.KidsTeenagers]: <KidIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.SwimmingPool]: (
      <SwimmingPoolIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.CommunityGardens]: (
      <GardensIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Connector]: <SewerageIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.FrontGardens]: (
      <FrontGardensIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Greenery]: <TreeIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Lamp]: <LampIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.SpatialPlanning]: (
      <SpatialPlanningIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Waste]: <BasketIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Security]: <SecurityIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Marianum]: <MarianumIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Mosquito]: <MosquitoIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.ChristmasTree]: (
      <ChristmasTreeIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Housing]: <HousingIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Transport]: <TransportIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Excavations]: (
      <ExcavationsIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.ManagementCommunications]: (
      <ManagmentCommunicationsIcon className={className} />
    ),
    [Enum_Componentblocksmunicipalservice_Icon.Parking]: <ParkingIcon className={className} />,
    [Enum_Componentblocksmunicipalservice_Icon.Towing]: <TowIcon className={className} />,
  } as const

  return iconComponentMap[iconName]
}

const getTagStyle = (color: Enum_Componentblocksmunicipalservice_Color) => {
  const tagStyleMap: Record<Enum_Componentblocksmunicipalservice_Color, string> = {
    [Enum_Componentblocksmunicipalservice_Color.Transport]: 'text-transport-700 bg-transport-100',
    [Enum_Componentblocksmunicipalservice_Color.Environment]:
      'text-environment-700 bg-environment-100',
    [Enum_Componentblocksmunicipalservice_Color.Social]: 'text-social-700 bg-social-100',
    [Enum_Componentblocksmunicipalservice_Color.Education]: 'text-education-700 bg-education-100',
    [Enum_Componentblocksmunicipalservice_Color.Culture]: 'text-culture-700 bg-culture-100',
    [Enum_Componentblocksmunicipalservice_Color.Main]: 'text-main-700 bg-main-100',
  } as const

  return tagStyleMap[color]
}

const MunicipalServicesSection = ({
  municipalServicesPage,
  categories,
}: MunicipalServicesSectionProps) => {
  const { t } = useTranslation('account')
  const { width } = useWindowSize()
  const [currentPage, setCurrentPage] = useState<number>(1)

  const enumOptions: SelectOption[] = [
    { value: 'ALL_CATEGORY', label: 'Všetky kategórie' },
    ...categories.map((category) => ({
      value: category,
      label: category,
    })),
  ]

  const [selectorValue, setSelectorValue] = useState<SelectOption>(enumOptions[0])
  const ITEMS_PER_PAGE = width > 480 ? 20 : 5

  const { isLegalEntity } = useSsrAuth()

  const handleCategoryChange = (newSelectorValue: SelectOption) => {
    if (newSelectorValue.value !== selectorValue.value) {
      setCurrentPage(1)
    }
    setSelectorValue(newSelectorValue)
  }

  const filteredServices =
    municipalServicesPage.services
      ?.filter(isDefined)
      .filter((service) => (isLegalEntity ? service.isVisibleForPo : service.isVisibleForFo))
      .filter((service) =>
        selectorValue.value === 'ALL_CATEGORY'
          ? true
          : service.category?.data?.attributes?.title === selectorValue.value,
      ) ?? []

  return (
    <div className="flex flex-col">
      <MunicipalServicesSectionHeader
        enumOptions={enumOptions}
        setSelectorValue={handleCategoryChange}
        selectorValue={selectorValue}
        setCurrentPage={setCurrentPage}
        title={t('account_section_services.navigation')}
      />
      <div className="mx-auto w-full max-w-(--breakpoint-lg) pt-4 lg:pt-8">
        <h2 className="sr-only">{t('account_section_services.services_list')}</h2>
        <div className="grid grid-cols-1 gap-3 px-4 min-[615px]:grid-cols-2 min-[960px]:grid-cols-3 sm:gap-6 md:gap-8 lg:grid-cols-4 lg:px-0">
          {filteredServices
            .filter(
              (_, i) =>
                i + 1 <= currentPage * ITEMS_PER_PAGE && i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
            )
            .map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                buttonText={service.buttonText}
                icon={getIconComponent(service.icon, service.color)}
                href={service.href}
                tag={service.tag ?? undefined}
                tagStyle={service.tag ? getTagStyle(service.color) : undefined}
                plausibleProps={{ id: `Mestské služby: ${service.title}` }}
              />
            ))}
        </div>
        <div className="my-4 lg:my-8">
          <Pagination
            count={Math.ceil(filteredServices.length / ITEMS_PER_PAGE)}
            selectedPage={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default MunicipalServicesSection
