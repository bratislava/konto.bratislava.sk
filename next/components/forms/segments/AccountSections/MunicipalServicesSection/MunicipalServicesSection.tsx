import Alert from 'components/forms/info-components/Alert'
import MunicipalServicesSectionHeader from 'components/forms/segments/AccountSectionHeader/MunicipalServicesSectionHeader'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { useTranslation } from 'next-i18next'
import { ReactNode, useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

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
import BasketIcon from '../../../../../assets/icons/environment-construction/waste.svg'
import SecurityIcon from '../../../../../assets/icons/most-wanted-services/reporting-of-incentives.svg'
import MariniumIcon from '../../../../../assets/icons/other/marianum.svg'
import MosquitoIcon from '../../../../../assets/icons/other/mosquito-hunters.svg'
import ChristmasTreeIcon from '../../../../../assets/icons/other/tree.svg'
import TransportIcon from '../../../../../assets/icons/transport-and-maps/city-​​transport.svg'
import ExcavationsIcon from '../../../../../assets/icons/transport-and-maps/excavations.svg'
import ParkingIcon from '../../../../../assets/icons/transport-and-maps/parking.svg'
import TowIcon from '../../../../../assets/icons/transport-and-maps/towing.svg'
import { ROUTES } from '../../../../../frontend/api/constants'
import { SelectOption } from '../../../widget-components/SelectField/SelectOption.interface'

const ALL_CATEGORY = 'Všetky kategórie'
const TAXES_CATEGORY = 'Dane'
const CULTURE_CATEGORY = 'Kultúra a voľný čas'
const TRANSPORT_CATEGORY = 'MHD'
const SECURITY_CATEGORY = 'Nahlásiť problém'
// const ENVIROMENTS_CATEGORY = 'Nebytové priestory'
const BASKET_CATEGORY = 'Odpady'
const PARKING_CATEGORY = 'Parkovanie'
const MARINIUM_CATEGORY = 'Pohrebníctvo Marianum'
const ENTERTAINMENT_CATEGORY = 'Rýchle zásahy'
const CONSTRUCTION_CATEGORY = 'Výstavba'
const JOIN_CATEGORY = 'Zapojiť sa'
const GREEN_CATEGORY = 'Zeleň'

const enumOptions: SelectOption[] = [
  { const: 'ALL_CATEGORY', title: ALL_CATEGORY, description: '' },
  { const: 'TAXES_CATEGORY', title: TAXES_CATEGORY, description: '' },
  { const: 'CULTURE_CATEGORY', title: CULTURE_CATEGORY, description: '' },
  { const: 'TRANSPORT_CATEGORY', title: TRANSPORT_CATEGORY, description: '' },
  { const: 'SECURITY_CATEGORY', title: SECURITY_CATEGORY, description: '' },
  // { const: 'ENVIROMENTS_CATEGORY', title: ENVIROMENTS_CATEGORY, description: '' },
  { const: 'BASKET_CATEGORY', title: BASKET_CATEGORY, description: '' },
  { const: 'PARKING_CATEGORY', title: PARKING_CATEGORY, description: '' },
  { const: 'MARINIUM_CATEGORY', title: MARINIUM_CATEGORY, description: '' },
  { const: 'ENTERTAINMENT_CATEGORY', title: ENTERTAINMENT_CATEGORY, description: '' },
  { const: 'CONSTRUCTION_CATEGORY', title: CONSTRUCTION_CATEGORY, description: '' },
  { const: 'JOIN_CATEGORY', title: JOIN_CATEGORY, description: '' },
  { const: 'GREEN_CATEGORY', title: GREEN_CATEGORY, description: '' },
]

const MunicipalServicesSection = () => {
  const { t } = useTranslation('account')
  const { width } = useWindowSize()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectorValue, setSelectorValue] = useState<SelectOption[]>(enumOptions.slice(0, 1))
  const selectorValueTitle: string = selectorValue[0]?.title || ''
  const ITEMS_PER_PAGE = width > 480 ? 20 : 5

  type ServiceCardBase = {
    title: string
    description: string
    buttonText?: string
    className?: string
    linkType?: 'internal' | 'external'
    icon: ReactNode
    href?: string
    tag?: string
    tagStyle?: string
    category: string[]
    onPress?: () => void
  }
  const serviceCards: ServiceCardBase[] = [
    {
      title: t('account_section_services.cards.1.title'),
      description: t('account_section_services.cards.1.description'),
      buttonText: t('account_section_services.cards.1.buttonText'),
      icon: <TaxesIcon className="h-10 w-10 text-category-600 lg:h-12 lg:w-12" />,
      category: [TAXES_CATEGORY],
      linkType: 'internal',
      href: ROUTES.TAXES_AND_FEES,
    },
    {
      title: t('account_section_services.cards.32.title'),
      description: t('account_section_services.cards.32.description'),
      buttonText: t('account_section_services.cards.32.buttonText'),
      tagStyle: 'text-education-700 bg-education-100',
      icon: <SwimmingPoolIcon className="h-10 w-10 text-education-700 lg:h-12 lg:w-12" />,
      category: [CULTURE_CATEGORY],
      href: 'https://kupaliska.bratislava.sk',
    },
    {
      title: t('account_section_services.cards.2.title'),
      description: t('account_section_services.cards.2.description'),
      buttonText: t('account_section_services.cards.2.buttonText'),
      icon: <TransportIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />,
      category: [TRANSPORT_CATEGORY],
      href: 'https://eshop.dopravnakarta.sk/DPB/Karta',
    },
    {
      title: t('account_section_services.cards.3.title'),
      description: t('account_section_services.cards.3.description'),
      buttonText: t('account_section_services.cards.3.buttonText'),
      icon: <ParkingIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />,
      category: [PARKING_CATEGORY],
      href: 'https://paas.sk/formular/',
    },
    {
      title: t('account_section_services.cards.4.title'),
      description: t('account_section_services.cards.4.description'),
      buttonText: t('account_section_services.cards.4.buttonText'),
      icon: <ParkingIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />,
      category: [PARKING_CATEGORY],
      href: 'https://paas.sk/',
    },
    {
      title: t('account_section_services.cards.5.title'),
      description: t('account_section_services.cards.5.description'),
      buttonText: t('account_section_services.cards.5.buttonText'),
      icon: <LibraryIcon className="h-10 w-10 text-culture-700 lg:h-12 lg:w-12" />,
      category: [CULTURE_CATEGORY],
      href: 'https://mestskakniznica.sk/sluzby/citanie/ako-sa-prihlasit-do-kniznice',
    },
    {
      title: t('account_section_services.cards.6.title'),
      description: t('account_section_services.cards.6.description'),
      buttonText: t('account_section_services.cards.6.buttonText'),
      icon: <TowIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />,
      category: [PARKING_CATEGORY],
      href: 'https://mepasys.sk/odtiahli-ma/',
    },
    {
      title: t('account_section_services.cards.7.title'),
      description: t('account_section_services.cards.7.description'),
      buttonText: t('account_section_services.cards.7.buttonText'),
      icon: <KidIcon className="h-10 w-10 text-category-600 lg:h-12 lg:w-12" />,
      category: [JOIN_CATEGORY],
      href: 'https://mestopredeti.sk/',
    },
    {
      title: t('account_section_services.cards.8.title'),
      description: t('account_section_services.cards.8.description'),
      buttonText: t('account_section_services.cards.8.buttonText'),
      icon: <TreeIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [GREEN_CATEGORY],
      href: 'https://10000stromov.sk/',
    },
    {
      title: t('account_section_services.cards.9.title'),
      description: t('account_section_services.cards.9.description'),
      buttonText: t('account_section_services.cards.9.buttonText'),
      icon: <GardensIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [GREEN_CATEGORY, CULTURE_CATEGORY, JOIN_CATEGORY],
      href: 'https://bratislavskisusedia.sk/temy/komunitne-zahrady',
    },
    {
      title: t('account_section_services.cards.10.title'),
      description: t('account_section_services.cards.10.description'),
      buttonText: t('account_section_services.cards.10.buttonText'),
      icon: <TheatreIcon className="h-10 w-10 text-culture-700 lg:h-12 lg:w-12" />,
      category: [CULTURE_CATEGORY],
      href: 'https://vstupenky.dpoh.sk/',
    },
    {
      title: t('account_section_services.cards.11.title'),
      description: t('account_section_services.cards.11.description'),
      buttonText: t('account_section_services.cards.11.buttonText'),
      icon: <ExcavationsIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />,
      category: [SECURITY_CATEGORY],
      href: 'https://inovacie.bratislava.sk/nahlasit-problem/',
    },
    {
      title: t('account_section_services.cards.12.title'),
      description: t('account_section_services.cards.12.description'),
      buttonText: t('account_section_services.cards.12.buttonText'),
      icon: <SecurityIcon className="h-10 w-10 text-category-600 lg:h-12 lg:w-12" />,
      category: [ENTERTAINMENT_CATEGORY],
      href: 'https://bratislava.sk/rychle-zasahy',
    },
    {
      title: t('account_section_services.cards.13.title'),
      description: t('account_section_services.cards.13.description'),
      buttonText: t('account_section_services.cards.13.buttonText'),
      icon: <ZooIcon className="h-10 w-10 text-culture-700 lg:h-12 lg:w-12" />,
      category: [CULTURE_CATEGORY],
      href: 'https://www.zoobratislava.sk/vstupenky-online/',
    },
    {
      title: t('account_section_services.cards.14.title'),
      description: t('account_section_services.cards.14.description'),
      buttonText: t('account_section_services.cards.14.buttonText'),
      icon: <MosquitoIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [JOIN_CATEGORY],
      href: 'https://lovcikomarov.sk/',
    },
    {
      title: t('account_section_services.cards.33.title'),
      description: t('account_section_services.cards.33.description'),
      buttonText: t('account_section_services.cards.33.buttonText'),
      icon: <CulturalOrganizationIcon className="h-10 w-10 text-culture-700 lg:h-12 lg:w-12" />,
      category: [CULTURE_CATEGORY],
      href: 'https://gmb.sk/detail/online-predaj-vstupeniek-do-gmb',
    },
    // {
    //   title: t('account_section_services.cards.16.title'),
    //   description: t('account_section_services.cards.16.description'),
    //   buttonText: t('account_section_services.cards.16.buttonText'),
    //   icon: <MariniumIcon className="w-10 h-10 lg:w-12 lg:h-12" />,
    //   category: [MARINIUM_CATEGORY],
    //   href: 'https://marianum.sk/sluzby/hrobove-miesto/pridelenie-alebo-rezervacia-hroboveho-miesta',
    // },
    {
      title: t('account_section_services.cards.17.title'),
      description: t('account_section_services.cards.17.description'),
      buttonText: t('account_section_services.cards.17.buttonText'),
      icon: <KidIcon className="h-10 w-10 text-category-600 lg:h-12 lg:w-12" />,
      category: [JOIN_CATEGORY],
      href: 'https://www.detiprebratislavu.sk/prihlasit-projekt/',
    },
    {
      title: t('account_section_services.cards.18.title'),
      description: t('account_section_services.cards.18.description'),
      buttonText: t('account_section_services.cards.18.buttonText'),
      icon: <ChristmasTreeIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/stromceky/',
    },
    {
      title: t('account_section_services.cards.19.title'),
      description: t('account_section_services.cards.19.description'),
      buttonText: t('account_section_services.cards.19.buttonText'),
      icon: <FrontGardensIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [GREEN_CATEGORY],
      href: 'https://bratislavskisusedia.sk/temy/predzahradky',
    },
    {
      title: t('account_section_services.cards.20.title'),
      description: t('account_section_services.cards.20.description'),
      buttonText: t('account_section_services.cards.20.buttonText'),
      icon: <BasketIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/evidencia-neodvezeneho-odpadu/',
    },
    {
      title: t('account_section_services.cards.21.title'),
      description: t('account_section_services.cards.21.description'),
      buttonText: t('account_section_services.cards.21.buttonText'),
      icon: <BasketIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/odvozovy-den-triedeneho-odpadu-vrecovy-zber/',
    },
    {
      title: t('account_section_services.cards.22.title'),
      description: t('account_section_services.cards.22.description'),
      buttonText: t('account_section_services.cards.22.buttonText'),
      icon: <BasketIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/odvozovy-den-bro/',
    },
    {
      title: t('account_section_services.cards.23.title'),
      description: t('account_section_services.cards.23.description'),
      buttonText: t('account_section_services.cards.23.buttonText'),
      icon: <BasketIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/odv_zko/',
    },
    {
      title: t('account_section_services.cards.24.title'),
      description: t('account_section_services.cards.24.description'),
      buttonText: t('account_section_services.cards.24.buttonText'),
      icon: <BasketIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/odvozovy-den-k-bro/',
    },
    {
      title: t('account_section_services.cards.25.title'),
      description: t('account_section_services.cards.25.description'),
      buttonText: t('account_section_services.cards.25.buttonText'),
      icon: <MariniumIcon className="h-10 w-10 lg:h-12 lg:w-12" />,
      category: [MARINIUM_CATEGORY],
      href: 'https://marianum.sk/aktuality/zoznam-obradov',
    },
    // {
    //   title: t('account_section_services.cards.26.title'),
    //   description: t('account_section_services.cards.26.description'),
    //   buttonText: t('account_section_services.cards.26.buttonText'),
    //   icon: <AdministrationIcon className="w-10 h-10 lg:w-12 lg:h-12 text-category-600" />,
    //   category: [ENVIROMENTS_CATEGORY],
    //   href: 'https://cdn-api.bratislava.sk/static-pages/non-residential-premises-map/index.html?lang=sk',
    // },
    {
      title: t('account_section_services.cards.27.title'),
      description: t('account_section_services.cards.27.description'),
      buttonText: t('account_section_services.cards.27.buttonText'),
      icon: <MariniumIcon className="h-10 w-10 lg:h-12 lg:w-12" />,
      category: [MARINIUM_CATEGORY],
      href: 'https://marianum.sk/sluzby/hrobove-miesto/vyhladavanie-hrobovych-miest',
    },
    {
      title: t('account_section_services.cards.28.title'),
      description: t('account_section_services.cards.28.description'),
      buttonText: t('account_section_services.cards.28.buttonText'),
      icon: <SewerageIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [CONSTRUCTION_CATEGORY],
      href: 'https://www.bvsas.sk/domacnosti/nove-pripojenie/',
    },
    {
      title: t('account_section_services.cards.29.title'),
      description: t('account_section_services.cards.29.description'),
      buttonText: t('account_section_services.cards.29.buttonText'),
      icon: <BasketIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />,
      category: [BASKET_CATEGORY],
      href: 'https://www.olo.sk/ponuka-sluzieb/objednavka-sluzieb-pre-obyvatelov/',
    },
    // {
    //   title: t('account_section_services.cards.30.title'),
    //   description: t('account_section_services.cards.30.description'),
    //   buttonText: t('account_section_services.cards.30.buttonText'),
    //   icon: <BasketIcon className="w-10 h-10 lg:w-12 lg:h-12 text-environment-700" />,
    //   category: [BASKET_CATEGORY],
    //   href: '',
    // },
    // {
    //   title: t('account_section_services.cards.31.title'),
    //   description: t('account_section_services.cards.31.description'),
    //   buttonText: t('account_section_services.cards.31.buttonText'),
    //   icon: <BasketIcon className="w-10 h-10 lg:w-12 lg:h-12 text-environment-700" />,
    //   category: [BASKET_CATEGORY],
    //   href: '',
    // },
  ]

  const filteredServiceCards = serviceCards.filter((card) =>
    selectorValueTitle === ALL_CATEGORY ? true : card.category.includes(selectorValueTitle),
  )

  return (
    <div className="flex flex-col">
      <MunicipalServicesSectionHeader
        enumOptions={enumOptions}
        setSelectorValue={setSelectorValue}
        selectorValue={selectorValue}
        setCurrentPage={setCurrentPage}
        title={t('account_section_services.navigation')}
      />
      <div className="mx-auto w-full max-w-screen-lg pt-4 lg:pt-8">
        <Alert
          message={t('account_section_services.alert_text')}
          type="info"
          fullWidth
          className="mx-4 mb-4 lg:mx-0 lg:mb-8"
        />
        <div className="grid grid-cols-1 gap-3 px-4 sm:gap-6 min-[615px]:grid-cols-2 md:gap-8 min-[960px]:grid-cols-3 lg:grid-cols-4 lg:px-0">
          {filteredServiceCards
            .filter(
              (_, i) =>
                i + 1 <= currentPage * ITEMS_PER_PAGE && i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
            )
            .map((card, i) => (
              <ServiceCard
                key={i}
                className={card.className}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                linkType={card.linkType}
                icon={card.icon}
                href={card.href}
                tag={card.tag}
                tagStyle={card.tagStyle}
                onPress={card.onPress}
                plausibleProps={{ id: `Mestské služby: ${card.title}` }}
              />
            ))}
        </div>
        <div className="my-4 lg:my-8">
          <Pagination
            count={Math.ceil(filteredServiceCards.length / ITEMS_PER_PAGE)}
            selectedPage={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default MunicipalServicesSection
