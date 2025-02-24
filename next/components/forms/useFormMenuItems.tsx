import { BinIcon, ConnectionIcon, DiscIcon, DownloadIcon, PdfIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'

import { useFormExportImport } from '../../frontend/hooks/useFormExportImport'
import { isDefined } from '../../frontend/utils/general'
import { MenuItemBase } from './simple-components/MenuDropdown/MenuDropdown'
import { useFormContext } from './useFormContext'
import { useFormModals } from './useFormModals'

type FormMenuItem = MenuItemBase & {
  dataCy?: string
  className?: string
}

export const useFormMenuItems = (): FormMenuItem[] => {
  const {
    isReadonly,
    isDeletable,
    xmlImportExportAllowed,
    jsonImportExportAllowed,
    pdfDownloadInMenuAllowed,
  } = useFormContext()
  const { exportXml, exportPdf, importXml, saveConcept, deleteConcept, exportJson, importJson } =
    useFormExportImport()
  const { t } = useTranslation('forms')
  const { setDeleteConceptModal } = useFormModals()

  return [
    isReadonly
      ? null
      : {
          title: t('menu_list.save_concept'),
          icon: <DiscIcon className="size-6" />,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => saveConcept(),
          dataCy: 'save-concept-mobile',
        },
    xmlImportExportAllowed
      ? {
          title: t('menu_list.download_xml'),
          icon: <DownloadIcon className="size-6" />,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => exportXml(),
        }
      : null,
    pdfDownloadInMenuAllowed
      ? {
          title: t('menu_list.pdf'),
          icon: <PdfIcon className="size-6" />,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => exportPdf(),
        }
      : null,
    !isReadonly && xmlImportExportAllowed
      ? {
          title: t('menu_list.upload_xml'),
          icon: <ConnectionIcon className="size-6" />,
          onPress: importXml,
        }
      : null,
    jsonImportExportAllowed
      ? {
          title: t('menu_list.download_json'),
          icon: <DownloadIcon className="size-6" />,
          onPress: exportJson,
        }
      : null,
    !isReadonly && jsonImportExportAllowed
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
          onPress: () => setDeleteConceptModal({ isOpen: true, confirmCallback: deleteConcept }),
          className: 'text-negative-700',
        },
  ].filter(isDefined)
}
