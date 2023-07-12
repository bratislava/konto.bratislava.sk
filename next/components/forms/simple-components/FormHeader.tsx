import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import ArrowsDownUpIcon from '@assets/images/new-icons/ui/arrows-down-up.svg'
import DiskIcon from '@assets/images/new-icons/ui/disc-fill.svg'
import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import LockIcon from '@assets/images/new-icons/ui/lock.svg'
import PdfIcon from '@assets/images/new-icons/ui/pdf.svg'
import cx from 'classnames'
import RegistrationModal from 'components/forms/segments/RegistrationModal/RegistrationModal'
import Button from 'components/forms/simple-components/Button'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Waves from 'components/forms/simple-components/Waves/Waves'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { useFormExportImport } from '../../../frontend/hooks/useFormExportImport'

interface FormHeaderProps {
  onSaveConcept: () => void
}

const FormHeader = ({ onSaveConcept }: FormHeaderProps) => {
  const { exportXml, exportPdf, importXml } = useFormExportImport()
  const { t } = useTranslation('forms')
  const { isAuthenticated } = useServerSideAuth()

  const [registrationModal, setRegistrationModal] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const formHeaderMenuContent: MenuItemBase[] = [
    {
      title: t('menu_list.eId'),
      icon: <LockIcon className="w-6 h-6" />,
      onPress: () => {},
    },
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="w-6 h-6" />,
      onPress: exportXml,
    },
    { title: t('menu_list.pdf'), icon: <PdfIcon className="w-6 h-6" />, onPress: exportPdf },
    {
      title: t('menu_list.upload_xml'),
      icon: <ArrowsDownUpIcon className="w-6 h-6" />,
      onPress: importXml,
    },
  ]

  const handleOnPressSaveConcept = () => {
    if (!isAuthenticated) {
      setRegistrationModal(true)
    } else {
      onSaveConcept()
    }
  }

  return (
    <div className="flex flex-col relative">
      <div className="min-h-none w-full h-full lg:min-h-[120px] bg-main-200 p-4 md:py-6 lg:py-12 lg:px-0">
        <div className="justify-between max-w-screen-lg mx-auto flex">
          <div className="flex flex-col gap-2 lg:gap-4">
            <h1 className="text-h1-form">Záväzné stanovisko k investičnej činnosti</h1>
            <Link className="text-p1-underline w-max" href="/">
              {t('form_header.services_link')}
            </Link>
          </div>
          <div className="h-full hidden lg:flex gap-3">
            <Button
              size="sm"
              variant="category-outline"
              startIcon={<DiskIcon className="w-5 h-5" />}
              text={t('menu_list.save_concept')}
              className="text-gray-700 hover:text-gray-600 focus:text-gray-800"
              onPress={handleOnPressSaveConcept}
            />
            <MenuDropdown
              setIsOpen={setIsMenuOpen}
              buttonTrigger={<ThreePointsIcon />}
              buttonClassName={cx(
                'flex justify-center items-center focus:outline-none w-10 h-10 rounded-lg border-2 border-main-700 bg-transparent text-gray-700 hover:text-gray-600 hover:border-main-600 focus:border-main-800 focus:text-gray-800',
                {
                  'text-gray-800 border-main-800': isMenuOpen,
                },
              )}
              items={formHeaderMenuContent}
            />
          </div>
        </div>
      </div>
      <Waves
        className="hidden lg:block"
        waveColor="rgb(var(--color-main-200))"
        wavePosition="bottom"
      />
      {!isAuthenticated && (
        <RegistrationModal
          title={t('account:register_modal.header_save_title')}
          subtitle={t('account:register_modal.header_save_subtitle')}
          isBottomButtons={false}
          show={registrationModal}
          onClose={() => setRegistrationModal(false)}
        />
      )}
    </div>
  )
}

export default FormHeader
