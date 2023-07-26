import { BinIcon, DownloadIcon, EllipsisVerticalIcon, ExportIcon, PdfIcon } from '@assets/ui-icons'
import cx from 'classnames'
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
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const [conceptModalShow, setConceptModalShow] = useState<boolean>(false)

  const conceptMenuContent: MenuItemBase[] = [
    {
      title: t('account_section_applications.concept_menu_list.download_xml'),
      icon: <DownloadIcon className="h-6 w-6" />,
      onPress: () => {},
    },
    {
      title: t('account_section_applications.concept_menu_list.download_pdf'),
      icon: <PdfIcon className="h-6 w-6" />,
      onPress: () => {},
    },
    {
      title: t('account_section_applications.concept_menu_list.delete'),
      itemClassName: 'text-negative-700',
      icon: <BinIcon className="h-6 w-6" />,
      onPress: () => setConceptModalShow(true),
    },
  ]

  return (
    <>
      {/* Desktop */}
      <div
        id="desktop-card"
        className="hidden h-[124px] w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white lg:flex"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col gap-1 pl-6">
            <span className="text-p3-semibold text-main-700">{data?.category}</span>
            <span className="text-20-semibold">{data?.title}</span>
            <span className="text-p3">{data?.subtitle}</span>
          </div>
          <div className="flex w-full items-center justify-end gap-6">
            <div className="flex w-full max-w-[200px] flex-col">
              <span className="text-16-semibold mb-1">
                {t('account_section_applications.navigation_concept_card.createDate')}
              </span>
              <span className="w-max">{data?.createDate}</span>
            </div>
          </div>
          <div className="mr-6 flex gap-4">
            <Button
              variant="black-outline"
              text={t('account_section_applications.navigation_concept_card.button_text')}
              endIcon={<ExportIcon />}
              onPress={() => router.push(`${ROUTES.MY_APPLICATIONS}/1`)}
            />

            <MenuDropdown
              setIsOpen={setIsMenuOpen}
              buttonTrigger={
                <button
                  type="button"
                  className={cx(
                    'flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-200 bg-transparent text-gray-700 hover:text-gray-600 focus:border-gray-300 focus:text-gray-800 focus:outline-none',
                    {
                      'border-gray-300 text-gray-800': isMenuOpen,
                    },
                  )}
                >
                  <EllipsisVerticalIcon />
                </button>
              }
              items={conceptMenuContent}
            />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="flex h-[88px] w-full items-center justify-between border-b-2 border-gray-200 bg-white max-[389px]:h-[92px] lg:hidden"
      >
        <Link
          href={`${ROUTES.MY_APPLICATIONS}/1`}
          className="flex h-full w-full items-center justify-center"
        >
          <div className="flex w-full items-start justify-between">
            <div className="flex w-full flex-col max-[389px]:gap-1">
              <div className="flex items-center justify-between">
                <span className="text-p3-semibold text-main-700 max-[389px]:max-w-[220px]">
                  {data?.category}
                </span>
              </div>
              <span className="text-p2-semibold leading-5 max-[389px]:max-w-[220px]">
                {data?.title}
              </span>
            </div>
          </div>
        </Link>
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
