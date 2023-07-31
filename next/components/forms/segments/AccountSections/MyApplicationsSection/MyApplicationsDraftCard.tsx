import { BinIcon, DownloadIcon, EllipsisVerticalIcon, ExportIcon, PdfIcon } from '@assets/ui-icons'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import FormatDate from '../../../simple-components/FormatDate'

export type MyApplicationsDraftCardProps = {
  title: string
  linkHref: string
  category?: string
  subtext?: string
  createdAt: string
  onDeleteCard?: (id: string) => void
}

// TODO menu, delete draft...
const MyApplicationsDraftCard = ({
  title,
  category,
  subtext,
  linkHref,
  createdAt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDeleteCard,
}: MyApplicationsDraftCardProps) => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div className="relative flex w-full items-stretch rounded-lg border-2 border-gray-200 bg-white p-6 max-lg:hidden">
        <div className="flex w-full gap-6">
          <div className="flex w-full grow flex-col gap-1">
            {category && <div className="text-p3-semibold text-main-700">{category}</div>}
            <h3 className="text-20-semibold">{title}</h3>
            {subtext && <div className="text-p3">{subtext}</div>}
          </div>

          <div className="flex items-center gap-10">
            <div className="flex w-[200px] flex-col gap-1">
              <div className="text-16-semibold">
                {t('account_section_applications.navigation_concept_card.createDate')}
              </div>
              <div>
                <FormatDate>{createdAt}</FormatDate>
              </div>
            </div>

            {/* Width of this div is computed to match layout of SentCard */}
            <div className="flex w-[242px] items-center justify-end gap-4">
              {/* FIXME refactor to href, open in new tab */}
              <Button
                variant="black-outline"
                text={t('account_section_applications.navigation_concept_card.button_text')}
                endIcon={<ExportIcon />}
                onPress={() => router.push(linkHref)}
              />
              <MenuDropdown
                setIsOpen={setIsMenuOpen}
                buttonTrigger={
                  // FIXME refactor to Button
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
      </div>

      {/* Mobile */}
      <div className="relative flex w-full items-start justify-between border-b-2 border-gray-200 bg-white py-4 lg:hidden">
        <div className="flex w-full flex-col gap-1.5">
          {category && <div className="text-p3-semibold text-main-700">{category}</div>}
          <h3 className="text-p2-semibold leading-5">
            <Link href={linkHref} className="after:absolute after:inset-0">
              {title}
            </Link>
          </h3>
        </div>
      </div>

      {/* <ConceptDeleteModal */}
      {/*  conceptData={data} */}
      {/*  show={conceptModalShow} */}
      {/*  onClose={() => setConceptModalShow(false)} */}
      {/*  onDelete={() => { */}
      {/*    onDeleteCard() */}
      {/*    setConceptModalShow(false) */}
      {/*  }} */}
      {/* /> */}
    </>
  )
}

export default MyApplicationsDraftCard
