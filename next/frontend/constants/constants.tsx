import { ROUTES } from 'frontend/api/constants'
import { ReactNode } from 'react'

import AdministrationIcon from '../../assets/icons/city-bratislava/city-administration.svg'
import PublicSpaceOccupationIcon from '../../assets/icons/city-bratislava/public-space-occupation.svg'
import TaxesIcon from '../../assets/icons/city-bratislava/taxes.svg'
import CulturalOrganizationIcon from '../../assets/icons/culture-communities/cultural-organizations.svg'
import TheatreIcon from '../../assets/icons/culture-communities/events-support.svg'
import LibraryIcon from '../../assets/icons/culture-communities/library.svg'
import ZooIcon from '../../assets/icons/culture-communities/zoo.svg'
import KidIcon from '../../assets/icons/education-sport/kids-teenagers.svg'
import SwimmingPoolIcon from '../../assets/icons/education-sport/swimming-pool.svg'
import GardensIcon from '../../assets/icons/environment-construction/community-gardens.svg'
import SewerageIcon from '../../assets/icons/environment-construction/connector.svg'
import FrontGardensIcon from '../../assets/icons/environment-construction/front-gardens.svg'
import TreeIcon from '../../assets/icons/environment-construction/greenery.svg'
import SpatialPlanningIcon from '../../assets/icons/environment-construction/spatial-planning.svg'
import BasketIcon from '../../assets/icons/environment-construction/waste.svg'
import SecurityIcon from '../../assets/icons/most-wanted-services/reporting-of-incentives.svg'
import MarianumIcon from '../../assets/icons/other/marianum.svg'
import MosquitoIcon from '../../assets/icons/other/mosquito-hunters.svg'
import ChristmasTreeIcon from '../../assets/icons/other/tree.svg'
import TransportIcon from '../../assets/icons/transport-and-maps/city-​​transport.svg'
import ExcavationsIcon from '../../assets/icons/transport-and-maps/excavations.svg'
import ManagmentCommunicationsIcon from '../../assets/icons/transport-and-maps/management-communications.svg'
import ParkingIcon from '../../assets/icons/transport-and-maps/parking.svg'
import TowIcon from '../../assets/icons/transport-and-maps/towing.svg'

export const MunicipalServicesCategories = {
  ALL_CATEGORY: 'Všetky kategórie',
  TAXES_CATEGORY: 'Dane',
  CULTURE_CATEGORY: 'Kultúra a voľný čas',
  TRANSPORT_CATEGORY: 'Doprava',
  ENVIROMENTS_CATEGORY: 'Nebytové priestory',
  BASKET_CATEGORY: 'Odpady',
  MARIANUM_CATEGORY: 'Pohrebníctvo Marianum',
  QUICK_INTERVENTION_CATEGORY: 'Rýchle zásahy',
  CONSTRUCTION_CATEGORY: 'Výstavba',
  JOIN_CATEGORY: 'Zapojiť sa',
  GREEN_CATEGORY: 'Zeleň',
  PUBLIC_SPACE_CATEGORY: 'Verejné priestranstvo',
}

type ServiceCardBase = {
  id: number
  title: string
  description: string
  buttonText: string
  icon: ReactNode
  href: string
  tag?: string
  tagStyle?: string
  category: string[]
}

export const serviceCards: ServiceCardBase[] = [
  {
    id: 1,
    title: 'account_section_services.cards.1.title',
    description: 'account_section_services.cards.1.description',
    buttonText: 'account_section_services.cards.1.buttonText',
    icon: <TaxesIcon className="size-10 text-main-600 lg:size-12" />,
    category: [MunicipalServicesCategories.TAXES_CATEGORY],
    href: ROUTES.TAXES_AND_FEES,
  },

  {
    id: 2,
    title: 'account_section_services.cards.2.title',
    description: 'account_section_services.cards.2.description',
    buttonText: 'account_section_services.cards.2.buttonText',
    icon: <TransportIcon className="size-10 text-transport-700 lg:size-12" />,
    category: [MunicipalServicesCategories.TRANSPORT_CATEGORY],
    href: 'https://eshop.dopravnakarta.sk/DPB/Karta',
  },
  {
    id: 3,
    title: 'account_section_services.cards.3.title',
    description: 'account_section_services.cards.3.description',
    buttonText: 'account_section_services.cards.3.buttonText',
    icon: <ParkingIcon className="size-10 text-transport-700 lg:size-12" />,
    category: [MunicipalServicesCategories.TRANSPORT_CATEGORY],
    href: 'https://paas.sk/formular/',
  },
  {
    id: 4,
    title: 'account_section_services.cards.4.title',
    description: 'account_section_services.cards.4.description',
    buttonText: 'account_section_services.cards.4.buttonText',
    icon: <ParkingIcon className="size-10 text-transport-700 lg:size-12" />,
    category: [MunicipalServicesCategories.TRANSPORT_CATEGORY],
    href: 'https://paas.sk/',
  },
  {
    id: 5,
    title: 'account_section_services.cards.5.title',
    description: 'account_section_services.cards.5.description',
    buttonText: 'account_section_services.cards.5.buttonText',
    icon: <LibraryIcon className="size-10 text-culture-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CULTURE_CATEGORY],
    href: 'https://mestskakniznica.sk/sluzby/citanie/ako-sa-prihlasit-do-kniznice',
  },
  {
    id: 6,
    title: 'account_section_services.cards.6.title',
    description: 'account_section_services.cards.6.description',
    buttonText: 'account_section_services.cards.6.buttonText',
    icon: <TowIcon className="size-10 text-transport-700 lg:size-12" />,
    category: [MunicipalServicesCategories.TRANSPORT_CATEGORY],
    href: 'https://mepasys.sk/odtiahli-ma/',
  },
  {
    id: 7,
    title: 'account_section_services.cards.7.title',
    description: 'account_section_services.cards.7.description',
    buttonText: 'account_section_services.cards.7.buttonText',
    icon: <KidIcon className="size-10 text-main-600 lg:size-12" />,
    category: [MunicipalServicesCategories.JOIN_CATEGORY],
    href: 'https://mestopredeti.sk/',
  },
  {
    id: 8,
    title: 'account_section_services.cards.8.title',
    description: 'account_section_services.cards.8.description',
    buttonText: 'account_section_services.cards.8.buttonText',
    icon: <TreeIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.GREEN_CATEGORY],
    href: 'https://10000stromov.sk/',
  },
  {
    id: 9,
    title: 'account_section_services.cards.9.title',
    description: 'account_section_services.cards.9.description',
    buttonText: 'account_section_services.cards.9.buttonText',
    icon: <GardensIcon className="size-10 text-environment-700 lg:size-12" />,
    tag: 'account_section_services.cards.9.tag',
    tagStyle: 'text-environment-700 bg-environment-100',
    category: [
      MunicipalServicesCategories.GREEN_CATEGORY,
      MunicipalServicesCategories.CULTURE_CATEGORY,
      MunicipalServicesCategories.JOIN_CATEGORY,
    ],
    href: 'https://konto.bratislava.sk/mestske-sluzby/komunitne-zahrady',
  },
  {
    id: 10,
    title: 'account_section_services.cards.10.title',
    description: 'account_section_services.cards.10.description',
    buttonText: 'account_section_services.cards.10.buttonText',
    icon: <TheatreIcon className="size-10 text-culture-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CULTURE_CATEGORY],
    href: 'https://vstupenky.dpoh.sk/',
  },
  {
    id: 11,
    title: 'account_section_services.cards.11.title',
    description: 'account_section_services.cards.11.description',
    buttonText: 'account_section_services.cards.11.buttonText',
    icon: <ExcavationsIcon className="size-10 text-transport-700 lg:size-12" />,
    category: [MunicipalServicesCategories.PUBLIC_SPACE_CATEGORY],
    href: 'https://inovacie.bratislava.sk/nahlasit-problem/',
  },
  {
    id: 12,
    title: 'account_section_services.cards.12.title',
    description: 'account_section_services.cards.12.description',
    buttonText: 'account_section_services.cards.12.buttonText',
    icon: <SecurityIcon className="size-10 text-main-600 lg:size-12" />,
    category: [MunicipalServicesCategories.QUICK_INTERVENTION_CATEGORY],
    href: 'https://bratislava.sk/rychle-zasahy',
  },
  {
    id: 13,
    title: 'account_section_services.cards.13.title',
    description: 'account_section_services.cards.13.description',
    buttonText: 'account_section_services.cards.13.buttonText',
    icon: <ZooIcon className="size-10 text-culture-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CULTURE_CATEGORY],
    href: 'https://www.zoobratislava.sk/vstupenky-online/',
  },
  {
    id: 14,
    title: 'account_section_services.cards.14.title',
    description: 'account_section_services.cards.14.description',
    buttonText: 'account_section_services.cards.14.buttonText',
    icon: <MosquitoIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.JOIN_CATEGORY],
    href: 'https://lovcikomarov.sk/',
  },
  {
    id: 15,
    title: 'account_section_services.cards.15.title',
    description: 'account_section_services.cards.15.description',
    buttonText: 'account_section_services.cards.15.buttonText',
    icon: <MarianumIcon className="size-10 lg:size-12" />,
    category: [MunicipalServicesCategories.MARIANUM_CATEGORY],
    href: 'https://marianum.sk/sluzby/hrobove-miesto/pridelenie-alebo-rezervacia-hroboveho-miesta',
  },
  {
    id: 16,
    title: 'account_section_services.cards.16.title',
    description: 'account_section_services.cards.16.description',
    buttonText: 'account_section_services.cards.16.buttonText',
    icon: <MarianumIcon className="size-10 lg:size-12" />,
    category: [MunicipalServicesCategories.MARIANUM_CATEGORY],
    href: 'https://marianum.sk/sluzby/hrobove-miesto/pridelenie-alebo-rezervacia-hroboveho-miesta',
  },
  {
    id: 17,
    title: 'account_section_services.cards.17.title',
    description: 'account_section_services.cards.17.description',
    buttonText: 'account_section_services.cards.17.buttonText',
    icon: <KidIcon className="size-10 text-main-600 lg:size-12" />,
    category: [MunicipalServicesCategories.JOIN_CATEGORY],
    href: 'https://www.detiprebratislavu.sk/prihlasit-projekt/',
  },
  {
    id: 18,
    title: 'account_section_services.cards.18.title',
    description: 'account_section_services.cards.18.description',
    buttonText: 'account_section_services.cards.18.buttonText',
    icon: <ChristmasTreeIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/stromceky/',
  },
  {
    id: 19,
    title: 'account_section_services.cards.19.title',
    description: 'account_section_services.cards.19.description',
    buttonText: 'account_section_services.cards.19.buttonText',
    icon: <FrontGardensIcon className="size-10 text-environment-700 lg:size-12" />,
    tag: 'account_section_services.cards.19.tag',
    tagStyle: 'text-environment-700 bg-environment-100',
    category: [MunicipalServicesCategories.GREEN_CATEGORY],
    href: 'https://konto.bratislava.sk/mestske-sluzby/predzahradky',
  },
  {
    id: 20,
    title: 'account_section_services.cards.20.title',
    description: 'account_section_services.cards.20.description',
    buttonText: 'account_section_services.cards.20.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/evidencia-neodvezeneho-odpadu/',
  },
  {
    id: 21,
    title: 'account_section_services.cards.21.title',
    description: 'account_section_services.cards.21.description',
    buttonText: 'account_section_services.cards.21.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/odvozovy-den-triedeneho-odpadu-vrecovy-zber/',
  },
  {
    id: 22,
    title: 'account_section_services.cards.22.title',
    description: 'account_section_services.cards.22.description',
    buttonText: 'account_section_services.cards.22.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/odvozovy-den-bro/',
  },
  {
    id: 23,
    title: 'account_section_services.cards.23.title',
    description: 'account_section_services.cards.23.description',
    buttonText: 'account_section_services.cards.23.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/odv_zko/',
  },
  {
    id: 24,
    title: 'account_section_services.cards.24.title',
    description: 'account_section_services.cards.24.description',
    buttonText: 'account_section_services.cards.24.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/odvozovy-den-k-bro/',
  },
  {
    id: 25,
    title: 'account_section_services.cards.25.title',
    description: 'account_section_services.cards.25.description',
    buttonText: 'account_section_services.cards.25.buttonText',
    icon: <MarianumIcon className="size-10 lg:size-12" />,
    category: [MunicipalServicesCategories.MARIANUM_CATEGORY],
    href: 'https://marianum.sk/aktuality/zoznam-obradov',
  },
  {
    id: 26,
    title: 'account_section_services.cards.26.title',
    description: 'account_section_services.cards.26.description',
    buttonText: 'account_section_services.cards.26.buttonText',
    icon: <AdministrationIcon className="size-10 text-main-600 lg:size-12" />,
    category: [MunicipalServicesCategories.ENVIROMENTS_CATEGORY],
    href: 'https://cdn-api.bratislava.sk/static-pages/non-residential-premises-map/index.html?lang=sk',
  },
  {
    id: 27,
    title: 'account_section_services.cards.27.title',
    description: 'account_section_services.cards.27.description',
    buttonText: 'account_section_services.cards.27.buttonText',
    icon: <MarianumIcon className="size-10 lg:size-12" />,
    category: [MunicipalServicesCategories.MARIANUM_CATEGORY],
    href: 'https://marianum.sk/sluzby/hrobove-miesto/vyhladavanie-hrobovych-miest',
  },
  {
    id: 28,
    title: 'account_section_services.cards.28.title',
    description: 'account_section_services.cards.28.description',
    buttonText: 'account_section_services.cards.28.buttonText',
    icon: <SewerageIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CONSTRUCTION_CATEGORY],
    href: 'https://www.bvsas.sk/domacnosti/nove-pripojenie/',
  },
  {
    id: 29,
    title: 'account_section_services.cards.29.title',
    description: 'account_section_services.cards.29.description',
    buttonText: 'account_section_services.cards.29.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/ponuka-sluzieb/objednavka-sluzieb-pre-obyvatelov/',
  },
  {
    id: 30,
    title: 'account_section_services.cards.30.title',
    description: 'account_section_services.cards.30.description',
    buttonText: 'account_section_services.cards.30.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: '',
  },
  {
    id: 31,
    title: 'account_section_services.cards.31.title',
    description: 'account_section_services.cards.31.description',
    buttonText: 'account_section_services.cards.31.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: '',
  },
  {
    id: 32,
    title: 'account_section_services.cards.32.title',
    description: 'account_section_services.cards.32.description',
    buttonText: 'account_section_services.cards.32.buttonText',
    tagStyle: 'text-education-700 bg-education-100',
    icon: <SwimmingPoolIcon className="size-10 text-education-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CULTURE_CATEGORY],
    href: 'https://kupaliska.bratislava.sk',
  },
  {
    id: 33,
    title: 'account_section_services.cards.33.title',
    description: 'account_section_services.cards.33.description',
    buttonText: 'account_section_services.cards.33.buttonText',
    icon: <CulturalOrganizationIcon className="size-10 text-culture-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CULTURE_CATEGORY],
    href: 'https://gmb.sk/detail/online-predaj-vstupeniek-do-gmb',
  },
  {
    id: 34,
    title: 'account_section_services.cards.34.title',
    description: 'account_section_services.cards.34.description',
    buttonText: 'account_section_services.cards.34.buttonText',
    icon: <SpatialPlanningIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CONSTRUCTION_CATEGORY],
    href: ROUTES.MUNICIPAL_SERVICES_INVESTING,
  },
  {
    id: 35,
    title: 'account_section_services.cards.35.title',
    description: 'account_section_services.cards.35.description',
    buttonText: 'account_section_services.cards.35.buttonText',
    icon: <SpatialPlanningIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.CONSTRUCTION_CATEGORY],
    href: ROUTES.MUNICIPAL_SERVICES_INVESTING_INTENT,
  },
  {
    id: 36,
    title: 'account_section_services.cards.36.title',
    description: 'account_section_services.cards.36.description',
    buttonText: 'account_section_services.cards.36.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/ponuka-sluzieb/objednavka-sluzieb-pre-pravnicke-osoby/',
  },
  {
    id: 37,
    title: 'account_section_services.cards.37.title',
    description: 'account_section_services.cards.37.description',
    buttonText: 'account_section_services.cards.37.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/ponuka-sluzieb/objednavka-sluzieb-pre-pravnicke-osoby/',
  },
  {
    id: 38,
    title: 'account_section_services.cards.38.title',
    description: 'account_section_services.cards.38.description',
    buttonText: 'account_section_services.cards.38.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/ponuka-sluzieb/objednavka-sluzieb-pre-pravnicke-osoby/',
  },
  {
    id: 39,
    title: 'account_section_services.cards.39.title',
    description: 'account_section_services.cards.39.description',
    buttonText: 'account_section_services.cards.39.buttonText',
    icon: <BasketIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.BASKET_CATEGORY],
    href: 'https://www.olo.sk/ponuka-sluzieb/objednavka-sluzieb-pre-pravnicke-osoby/',
  },
  {
    id: 40,
    title: 'account_section_services.cards.40.title',
    description: 'account_section_services.cards.40.description',
    buttonText: 'account_section_services.cards.40.buttonText',
    icon: <PublicSpaceOccupationIcon className="size-10 text-main-600 lg:size-12" />,
    category: [MunicipalServicesCategories.PUBLIC_SPACE_CATEGORY],
    href: 'https://bratislava.sk/mesto-bratislava/transparentne-mesto/majetok-mesta/zaujatie-verejneho-priestranstva',
  },
  {
    id: 41,
    title: 'account_section_services.cards.41.title',
    description: 'account_section_services.cards.41.description',
    buttonText: 'account_section_services.cards.41.buttonText',
    icon: <ManagmentCommunicationsIcon className="size-10 text-transport-700 lg:size-12" />,
    category: [MunicipalServicesCategories.TRANSPORT_CATEGORY],
    href: 'https://bratislava.sk/doprava-a-mapy/doprava/dopravne-povolenia',
  },
  {
    id: 42,
    title: 'account_section_services.cards.42.title',
    description: 'account_section_services.cards.42.description',
    buttonText: 'account_section_services.cards.42.buttonText',
    icon: <FrontGardensIcon className="size-10 text-environment-700 lg:size-12" />,
    category: [MunicipalServicesCategories.GREEN_CATEGORY],
    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/zelen/udrzba-a-tvorba-zelene/adopcia-zelene',
  },
  {
    id: 43,
    title: 'account_section_services.cards.43.title',
    description: 'account_section_services.cards.43.description',
    buttonText: 'account_section_services.cards.43.buttonText',
    icon: <TaxesIcon className="size-10 text-main-600 lg:size-12" />,
    tag: 'account_section_services.cards.43.tag',
    tagStyle: 'text-main-700 bg-main-100',
    category: [MunicipalServicesCategories.TAXES_CATEGORY],
    href: ROUTES.MUNICIPAL_SERVICES_TAX,
  },
]

export const formsFeedbackLinks = {
  'stanovisko-k-investicnemu-zameru': 'https://bravo.staffino.com/bratislava/id=WW1hkstR',
  'zavazne-stanovisko-k-investicnej-cinnosti': 'https://bravo.staffino.com/bratislava/id=WW1vhwT6',
  'platba-dane-z-nehnutelnosti':
    'https://forms.office.com/Pages/DesignPageV2.aspx?origin=NeoPortalPage&subpage=design&id=Tudp_mYey0-ZxVjkotKgYzPfQUHlnllIsPHBW0o8KeNUQlMzWEw1WEZIWEM2SThRNVBUREhWNFlISC4u',
  'priznanie-k-dani-z-nehnutelnosti': 'https://bravo.staffino.com/bratislava/id=WW14qo6q',
}
