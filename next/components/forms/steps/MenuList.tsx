import { ConnectionIcon, DiscIcon, DownloadIcon, PdfIcon } from '@assets/ui-icons'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode, useState } from 'react'

import { useFormExportImport } from '../../../frontend/hooks/useFormExportImport'
import RegistrationModal from '../segments/RegistrationModal/RegistrationModal'

type MenuItem = {
  title: string
  icon: ReactNode
  url?: string
  onPress?: () => void
}

const MenuList = () => {
  const { exportXml, exportPdf, importXml, saveConcept } = useFormExportImport()

  const { t } = useTranslation('forms')

  const { isAuthenticated } = useServerSideAuth()
  const [registrationModal, setRegistrationModal] = useState<boolean>(false)

  const handleOnPressSaveConcept = async () => {
    if (!isAuthenticated) {
      setRegistrationModal(true)
    } else {
      await saveConcept()
    }
  }

  const menuList: MenuItem[] = [
    {
      title: t('menu_list.save_concept'),
      icon: <DiscIcon className="h-6 w-6" />,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPress: handleOnPressSaveConcept,
    },
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="h-6 w-6" />,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPress: () => exportXml(),
    },
    {
      title: t('menu_list.pdf'),
      icon: <PdfIcon className="h-6 w-6" />,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPress: () => exportPdf(),
    },
    {
      title: t('menu_list.upload_xml'),
      icon: <ConnectionIcon className="h-6 w-6" />,
      onPress: importXml,
    },
  ]

  return (
    <>
      <ul className="mt-4 flex flex-col gap-3 border-t-2 border-gray-200 pt-4 lg:hidden">
        {menuList.map((menuItem, i) =>
          menuItem.url ? (
            <li className="w-max" key={i}>
              <Link href={menuItem.url}>
                <div className="flex items-center gap-3">
                  {menuItem.icon}
                  <span className="text-p2">{menuItem.title}</span>
                </div>
              </Link>
            </li>
          ) : (
            <li className="w-max" key={i}>
              <button type="button" onClick={menuItem.onPress}>
                <div className="flex items-center gap-3">
                  {menuItem.icon}
                  <span className="text-p2">{menuItem.title}</span>
                </div>
              </button>
            </li>
          ),
        )}
      </ul>
      {/* TODO: Refactor save and move to FormModals */}
      <RegistrationModal
        title={t('account:register_modal.header_save_title')}
        subtitle={t('account:register_modal.header_save_subtitle')}
        isBottomButtons={false}
        isOpen={registrationModal}
        onOpenChange={setRegistrationModal}
        isDismissable
      />
    </>
  )
}

export default MenuList
