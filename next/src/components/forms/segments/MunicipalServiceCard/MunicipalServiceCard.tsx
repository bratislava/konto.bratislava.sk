import { ReactNode } from 'react'

import AdministrationIcon from '@/src/assets/icons/city-bratislava/city-administration.svg'
import PublicSpaceOccupationIcon from '@/src/assets/icons/city-bratislava/public-space-occupation.svg'
import TaxesIcon from '@/src/assets/icons/city-bratislava/taxes.svg'
import CulturalOrganizationIcon from '@/src/assets/icons/culture-communities/cultural-organizations.svg'
import TheatreIcon from '@/src/assets/icons/culture-communities/events-support.svg'
import LibraryIcon from '@/src/assets/icons/culture-communities/library.svg'
import ZooIcon from '@/src/assets/icons/culture-communities/zoo.svg'
import KidIcon from '@/src/assets/icons/education-sport/kids-teenagers.svg'
import SwimmingPoolIcon from '@/src/assets/icons/education-sport/swimming-pool.svg'
import GardensIcon from '@/src/assets/icons/environment-construction/community-gardens.svg'
import SewerageIcon from '@/src/assets/icons/environment-construction/connector.svg'
import FrontGardensIcon from '@/src/assets/icons/environment-construction/front-gardens.svg'
import TreeIcon from '@/src/assets/icons/environment-construction/greenery.svg'
import LampIcon from '@/src/assets/icons/environment-construction/lamp.svg'
import SpatialPlanningIcon from '@/src/assets/icons/environment-construction/spatial-planning.svg'
import BasketIcon from '@/src/assets/icons/environment-construction/waste.svg'
import SecurityIcon from '@/src/assets/icons/most-wanted-services/reporting-of-incentives.svg'
import MarianumIcon from '@/src/assets/icons/other/marianum.svg'
import MosquitoIcon from '@/src/assets/icons/other/mosquito-hunters.svg'
import ChristmasTreeIcon from '@/src/assets/icons/other/tree.svg'
import HousingIcon from '@/src/assets/icons/social-services/housing.svg'
import TransportIcon from '@/src/assets/icons/transport-and-maps/city-\u200B\u200Btransport.svg'
import ExcavationsIcon from '@/src/assets/icons/transport-and-maps/excavations.svg'
import ManagmentCommunicationsIcon from '@/src/assets/icons/transport-and-maps/management-communications.svg'
import ParkingIcon from '@/src/assets/icons/transport-and-maps/parking.svg'
import TowIcon from '@/src/assets/icons/transport-and-maps/towing.svg'
import {
  Enum_Municipalservice_Color,
  Enum_Municipalservice_Icon,
  MunicipalServiceCardEntityFragment,
  MunicipalServiceEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import ServiceCard from '@/src/components/forms/simple-components/ServiceCard'
import { isDefined } from '@/src/frontend/utils/general'

const getIconComponent = (
  iconName: Enum_Municipalservice_Icon,
  color: Enum_Municipalservice_Color,
) => {
  const colorClassMap: Record<Enum_Municipalservice_Color, string> = {
    [Enum_Municipalservice_Color.Transport]: 'text-transport-700',
    [Enum_Municipalservice_Color.Environment]: 'text-environment-700',
    [Enum_Municipalservice_Color.Social]: 'text-social-600',
    [Enum_Municipalservice_Color.Education]: 'text-education-600',
    [Enum_Municipalservice_Color.Culture]: 'text-culture-700',
    [Enum_Municipalservice_Color.Main]: 'text-main-600',
    [Enum_Municipalservice_Color.Marianum]: 'text-municipal-services-marianum',
    [Enum_Municipalservice_Color.Olo]: 'text-municipal-services-olo',
    [Enum_Municipalservice_Color.Tsb]: 'text-municipal-services-tsb',
  } as const

  const colorClass = colorClassMap[color]
  const className = `size-10 ${colorClass} lg:size-12`

  const iconComponentMap: Record<Enum_Municipalservice_Icon, ReactNode> = {
    [Enum_Municipalservice_Icon.Administration]: <AdministrationIcon className={className} />,
    [Enum_Municipalservice_Icon.PublicSpaceOccupation]: (
      <PublicSpaceOccupationIcon className={className} />
    ),
    [Enum_Municipalservice_Icon.Taxes]: <TaxesIcon className={className} />,
    [Enum_Municipalservice_Icon.CulturalOrganizations]: (
      <CulturalOrganizationIcon className={className} />
    ),
    [Enum_Municipalservice_Icon.EventsSupport]: <TheatreIcon className={className} />,
    [Enum_Municipalservice_Icon.Library]: <LibraryIcon className={className} />,
    [Enum_Municipalservice_Icon.Zoo]: <ZooIcon className={className} />,
    [Enum_Municipalservice_Icon.KidsTeenagers]: <KidIcon className={className} />,
    [Enum_Municipalservice_Icon.SwimmingPool]: <SwimmingPoolIcon className={className} />,
    [Enum_Municipalservice_Icon.CommunityGardens]: <GardensIcon className={className} />,
    [Enum_Municipalservice_Icon.Connector]: <SewerageIcon className={className} />,
    [Enum_Municipalservice_Icon.FrontGardens]: <FrontGardensIcon className={className} />,
    [Enum_Municipalservice_Icon.Greenery]: <TreeIcon className={className} />,
    [Enum_Municipalservice_Icon.Lamp]: <LampIcon className={className} />,
    [Enum_Municipalservice_Icon.SpatialPlanning]: <SpatialPlanningIcon className={className} />,
    [Enum_Municipalservice_Icon.Waste]: <BasketIcon className={className} />,
    [Enum_Municipalservice_Icon.Security]: <SecurityIcon className={className} />,
    [Enum_Municipalservice_Icon.Marianum]: <MarianumIcon className={className} />,
    [Enum_Municipalservice_Icon.Mosquito]: <MosquitoIcon className={className} />,
    [Enum_Municipalservice_Icon.ChristmasTree]: <ChristmasTreeIcon className={className} />,
    [Enum_Municipalservice_Icon.Housing]: <HousingIcon className={className} />,
    [Enum_Municipalservice_Icon.Transport]: <TransportIcon className={className} />,
    [Enum_Municipalservice_Icon.Excavations]: <ExcavationsIcon className={className} />,
    [Enum_Municipalservice_Icon.ManagementCommunications]: (
      <ManagmentCommunicationsIcon className={className} />
    ),
    [Enum_Municipalservice_Icon.Parking]: <ParkingIcon className={className} />,
    [Enum_Municipalservice_Icon.Towing]: <TowIcon className={className} />,
  } as const

  return iconComponentMap[iconName]
}

const getTagStyle = (color: Enum_Municipalservice_Color) => {
  const tagStyleMap: Record<Enum_Municipalservice_Color, string> = {
    [Enum_Municipalservice_Color.Transport]: 'text-transport-700 bg-transport-100',
    [Enum_Municipalservice_Color.Environment]: 'text-environment-700 bg-environment-100',
    [Enum_Municipalservice_Color.Social]: 'text-social-700 bg-social-100',
    [Enum_Municipalservice_Color.Education]: 'text-education-700 bg-education-100',
    [Enum_Municipalservice_Color.Culture]: 'text-culture-700 bg-culture-100',
    [Enum_Municipalservice_Color.Main]: 'text-main-700 bg-main-100',
    [Enum_Municipalservice_Color.Marianum]:
      'text-municipal-services-marianum bg-municipal-services-marianum-bg',
    [Enum_Municipalservice_Color.Olo]: 'text-municipal-services-olo bg-municipal-services-olo-bg',
    [Enum_Municipalservice_Color.Tsb]: 'text-municipal-services-tsb bg-municipal-services-tsb-bg',
  } as const

  return tagStyleMap[color]
}

type MunicipalServiceCardProps = {
  service: MunicipalServiceEntityFragment | MunicipalServiceCardEntityFragment
}

const MunicipalServiceCard = ({ service }: MunicipalServiceCardProps) => {
  if (!service.attributes) {
    return null
  }

  return (
    <ServiceCard
      key={service.id}
      title={service.attributes.title}
      description={service.attributes.description}
      buttonText={service.attributes.buttonText}
      icon={getIconComponent(service.attributes.icon, service.attributes.color)}
      href={service.attributes.href}
      tags={
        service.attributes.tags?.data?.map((tag) => tag.attributes?.title).filter(isDefined) ?? []
      }
      tagStyle={getTagStyle(service.attributes.color)}
      plausibleProps={{ id: `Mestské služby: ${service.attributes.title}` }}
    />
  )
}

export default MunicipalServiceCard
