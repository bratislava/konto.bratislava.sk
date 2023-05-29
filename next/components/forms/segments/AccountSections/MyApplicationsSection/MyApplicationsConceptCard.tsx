import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import TrashIcon from '@assets/images/new-icons/ui/basket.svg'
import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import ExportIcon from '@assets/images/new-icons/ui/export.svg'
import PdfIcon from '@assets/images/new-icons/ui/pdf.svg'
import ConceptDeleteModal from 'components/forms/segments/ConceptDeleteModal/ConceptDeleteModal'
import Button from 'components/forms/simple-components/Button'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { MyApplicationsConceptCardBase } from 'frontend/api/mocks/mocks'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'

type MyApplicationsConceptCardProps = {
  data: MyApplicationsConceptCardBase
  onDeleteCard: () => void
}

const MyApplicationsConceptCard = (props: MyApplicationsConceptCardProps) => {
  const { data, onDeleteCard } = props
  const { t } = useTranslation('account')
  const router = useRouter()

  const [conceptModalShow, setConceptModalShow] = useState<boolean>(false)

  const conceptMenuContent: MenuItemBase[] = [
    {
      title: t('account_section_applications.concept_menu_list.download_xml'),
      icon: <DownloadIcon className="w-6 h-6" />,
      onPress: () => {
        console.log('ssss')
      },
    },
    {
      title: t('account_section_applications.concept_menu_list.download_pdf'),
      icon: <PdfIcon className="w-6 h-6" />,
      url: '/',
    },
    {
      title: t('account_section_applications.concept_menu_list.delete'),
      itemClassName: 'text-negative-700',
      icon: <TrashIcon className="w-6 h-6" />,
      onPress: () => setConceptModalShow(true),
    },
  ]

  return (
    <>
      {/* Desktop */}
      <div
        id="desktop-card"
        className="rounded-lg bg-white w-full h-[124px] lg:flex hidden items-center justify-between border-2 border-gray-200"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex flex-col gap-1 pl-6">
            <span className="text-p3-semibold text-main-700">{data?.category}</span>
            <span className="text-20-semibold">{data?.title}</span>
            <span className="text-p3">{data?.subtitle}</span>
          </div>
          <div className="w-full justify-end flex items-center gap-6">
            <div className="flex flex-col w-full max-w-[200px]">
              <span className="text-16-semibold mb-1">
                {t('account_section_applications.navigation_concept_card.createDate')}
              </span>
              <span className="w-max">{data?.createDate}</span>
            </div>
          </div>
          <div className="flex gap-4 mr-6">
            <Button
              variant="black-outline"
              text={t('account_section_applications.navigation_concept_card.button_text')}
              endIcon={<ExportIcon />}
              onPress={() => router.push(`${ROUTES.MY_APPLICATIONS}/1`)}
            />
            <MenuDropdown
              buttonVariant="gray"
              buttonTrigger={<ThreePointsIcon />}
              buttonSize="lg"
              items={conceptMenuContent}
            />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="bg-white w-full h-[88px] max-[389px]:h-[92px] flex lg:hidden items-center justify-between border-b-2 border-gray-200"
      >
        <Link
          href={`${ROUTES.MY_APPLICATIONS}/1`}
          className="w-full h-full items-center flex justify-center"
        >
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col w-full max-[389px]:gap-1">
              <div className="flex items-center justify-between">
                <span className="text-p3-semibold max-[389px]:max-w-[220px] text-main-700">
                  {data?.category}
                </span>
              </div>
              <span className="text-p2-semibold leading-5 max-[389px]:max-w-[220px]">
                {data?.title}
              </span>
            </div>
          </div>
        </Link>
        <MenuDropdown
          buttonTrigger={<ThreePointsIcon />}
          buttonSize="lg"
          items={conceptMenuContent}
          mobileVariant
        />
      </div>
      <ConceptDeleteModal
        conceptData={data}
        show={conceptModalShow}
        onClose={() => setConceptModalShow(false)}
        onDelete={() => {
          onDeleteCard()
          setConceptModalShow(false)
        }}
      />
    </>
  )
}

export default MyApplicationsConceptCard
