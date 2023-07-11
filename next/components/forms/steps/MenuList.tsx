import ArrowsDownUpIcon from '@assets/images/new-icons/ui/arrows-down-up.svg'
import DiskIcon from '@assets/images/new-icons/ui/disc.svg'
import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import LockIcon from '@assets/images/new-icons/ui/lock.svg'
import PdfIcon from '@assets/images/new-icons/ui/pdf.svg'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode, useState } from 'react'

import RegistrationModal from '../segments/RegistrationModal/RegistrationModal'

type MenuItem = {
  title: string
  icon: ReactNode
  url?: string
  onPress?: () => void
}

interface FormHeaderProps {
  onExportXml: () => void
  onSaveConcept: () => void
  onImportXml: () => void
  onExportPdf: () => void
}

const MenuList = ({ onExportXml, onSaveConcept, onImportXml, onExportPdf }: FormHeaderProps) => {
  const { t } = useTranslation('forms')

  const { isAuthenticated } = useServerSideAuth()
  const [registrationModal, setRegistrationModal] = useState<boolean>(false)

  const handleOnPressSaveConcept = () => {
    if (!isAuthenticated) {
      setRegistrationModal(true)
    } else {
      onSaveConcept()
    }
  }

  const menuList: MenuItem[] = [
    {
      title: t('menu_list.save_concept'),
      icon: <DiskIcon className="w-6 h-6" />,
      onPress: handleOnPressSaveConcept,
    },
    {
      title: t('menu_list.eId'),
      icon: <LockIcon className="w-6 h-6" />,
      onPress: () => {},
    },
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="w-6 h-6" />,
      onPress: onExportXml,
    },
    {
      title: t('menu_list.pdf'),
      icon: <PdfIcon className="w-6 h-6" />,
      onPress: onExportPdf,
    },
    {
      title: t('menu_list.upload_xml'),
      icon: <ArrowsDownUpIcon className="w-6 h-6" />,
      onPress: onImportXml,
    },
  ]

  return (
    <>
      <ul className="flex lg:hidden flex-col gap-3 border-t-2 border-gray-200 mt-4 pt-4">
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
      {isAuthenticated && (
        <RegistrationModal
          title={t('account:register_modal.header_save_title')}
          subtitle={t('account:register_modal.header_save_subtitle')}
          isBottomButtons={false}
          show={registrationModal}
          onClose={() => setRegistrationModal(false)}
        />
      )}
    </>
  )
}

export default MenuList
