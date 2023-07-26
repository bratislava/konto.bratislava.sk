import {
  ConnectionIcon,
  DiscIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  LockIcon,
  PdfIcon,
} from '@assets/ui-icons'
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

const FormHeader = () => {
  const { exportXml, exportPdf, importXml, saveConcept } = useFormExportImport()
  const { t } = useTranslation('forms')
  const { isAuthenticated } = useServerSideAuth()

  const [registrationModal, setRegistrationModal] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const formHeaderMenuContent: MenuItemBase[] = [
    {
      title: t('menu_list.eId'),
      icon: <LockIcon className="h-6 w-6" />,
      onPress: () => {},
    },
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="h-6 w-6" />,
      onPress: exportXml,
    },
    { title: t('menu_list.pdf'), icon: <PdfIcon className="h-6 w-6" />, onPress: exportPdf },
    {
      title: t('menu_list.upload_xml'),
      icon: <ConnectionIcon className="h-6 w-6" />,
      onPress: importXml,
    },
  ]

  const handleOnPressSaveConcept = async () => {
    if (!isAuthenticated) {
      setRegistrationModal(true)
    } else {
      await saveConcept()
    }
  }

  return (
    <div className="relative flex flex-col">
      <div className="min-h-none h-full w-full bg-main-200 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
        <div className="mx-auto flex max-w-screen-lg justify-between">
          <div className="flex flex-col gap-2 lg:gap-4">
            <h1 className="text-h1-form">Záväzné stanovisko k investičnej činnosti</h1>
            <Link className="text-p1-underline w-max" href="/">
              {t('form_header.services_link')}
            </Link>
          </div>
          <div className="hidden h-full gap-3 lg:flex">
            <Button
              size="sm"
              variant="category-outline"
              startIcon={<DiscIcon className="h-5 w-5" />}
              text={t('menu_list.save_concept')}
              className="text-gray-700 hover:text-gray-600 focus:text-gray-800"
              onPress={handleOnPressSaveConcept}
            />
            <MenuDropdown
              setIsOpen={setIsMenuOpen}
              buttonTrigger={<EllipsisVerticalIcon />}
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
