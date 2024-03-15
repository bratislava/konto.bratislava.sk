import { BinIcon, ConnectionIcon, DiscIcon, DownloadIcon, PdfIcon } from '@assets/ui-icons'
import cx from 'classnames'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { useFormExportImport } from '../../../frontend/hooks/useFormExportImport'
import { useFormContext } from '../useFormContext'
import { useFormModals } from '../useFormModals'

type MenuItem = {
  title: string
  icon: ReactNode
  url?: string
  onPress?: () => void
  className?: string
  dataCy?: string
}

const MenuList = () => {
  const { isTaxForm, isReadonly, isDeletable } = useFormContext()
  const {
    exportXml,
    exportPdf,
    importXml,
    saveConcept,
    deleteConcept,
    showImportExportJson,
    exportJson,
    importJson,
  } = useFormExportImport()
  const { t } = useTranslation('forms')
  const { setDeleteConceptModal } = useFormModals()

  const menuList = [
    isReadonly
      ? null
      : {
          title: t('menu_list.save_concept'),
          icon: <DiscIcon className="size-6" />,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => saveConcept(),
          dataCy: 'save-concept-mobile',
        },
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="size-6" />,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPress: () => exportXml(),
    },
    isTaxForm
      ? null
      : {
          title: t('menu_list.pdf'),
          icon: <PdfIcon className="size-6" />,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => exportPdf(),
        },
    isReadonly
      ? null
      : {
          title: t('menu_list.upload_xml'),
          icon: <ConnectionIcon className="size-6" />,
          onPress: importXml,
        },
    showImportExportJson
      ? {
          title: t('menu_list.download_json'),
          icon: <DownloadIcon className="size-6" />,
          onPress: exportJson,
        }
      : null,
    showImportExportJson
      ? {
          title: t('menu_list.upload_json'),
          icon: <ConnectionIcon className="size-6" />,
          onPress: importJson,
        }
      : null,
    isDeletable
      ? null
      : {
          title: t('menu_list.delete'),
          icon: <BinIcon className="size-6" />,
          onPress: () => setDeleteConceptModal({ isOpen: true, sendCallback: deleteConcept }),
          className: 'text-negative-700',
        },
  ].filter(Boolean) as MenuItem[]

  return (
    <ul className="mt-4 flex flex-col gap-3 border-t-2 border-gray-200 pt-4 lg:hidden">
      {menuList.map((menuItem, i) =>
        menuItem.url ? (
          <li className="w-max" key={i}>
            <Link href={menuItem.url}>
              <div className={cx('flex items-center gap-3', menuItem.className)}>
                {menuItem.icon}
                <span className="text-p2">{menuItem.title}</span>
              </div>
            </Link>
          </li>
        ) : (
          <li className="w-max" key={i}>
            <button type="button" onClick={menuItem.onPress} data-cy={menuItem.dataCy ?? ''}>
              <div className={cx('flex items-center gap-3', menuItem.className)}>
                {menuItem.icon}
                <span className="text-p2">{menuItem.title}</span>
              </div>
            </button>
          </li>
        ),
      )}
    </ul>
  )
}

export default MenuList
