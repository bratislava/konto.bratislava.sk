import { useTranslation } from 'next-i18next/pages'

import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import { DropdownMenuItemProps } from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'
import { isDefined } from '@/src/frontend/utils/general'

type FormMenuItem = DropdownMenuItemProps & {
  dataCy?: string
  className?: string
}

export const useFormMenuItems = (): FormMenuItem[] => {
  const { t } = useTranslation()

  const {
    isReadonly,
    isDeletable,
    xmlImportExportAllowed,
    jsonImportExportAllowed,
    pdfDownloadInMenuAllowed,
  } = useFormContext()
  const { exportXml, exportPdf, importXml, saveConcept, deleteConcept, exportJson, importJson } =
    useFormExportImport()
  const { setDeleteConceptModal } = useFormModals()

  return [
    isReadonly
      ? null
      : {
          title: t('useFormMenuItems.saveConcept'),
          icon: <Icon name="save" className="size-6" />,

          onPress: () => saveConcept(),
          dataCy: 'save-concept-mobile',
        },
    xmlImportExportAllowed
      ? {
          title: t('useFormMenuItems.downloadXml'),
          icon: <Icon name="download" className="size-6" />,

          onPress: () => exportXml(),
        }
      : null,
    pdfDownloadInMenuAllowed
      ? {
          title: t('useFormMenuItems.pdf'),
          icon: <Icon name="pdf" className="size-6" />,

          onPress: () => exportPdf(),
        }
      : null,
    !isReadonly && xmlImportExportAllowed
      ? {
          title: t('useFormMenuItems.uploadXml'),
          icon: <Icon name="import-export" className="size-6" />,
          onPress: importXml,
        }
      : null,
    jsonImportExportAllowed
      ? {
          title: t('useFormMenuItems.downloadJson'),
          icon: <Icon name="download" className="size-6" />,
          onPress: exportJson,
        }
      : null,
    !isReadonly && jsonImportExportAllowed
      ? {
          title: t('useFormMenuItems.uploadJson'),
          icon: <Icon name="import-export" className="size-6" />,
          onPress: importJson,
        }
      : null,
    isDeletable
      ? null
      : {
          title: t('useFormMenuItems.delete'),
          icon: <Icon name="bin" className="size-6" />,
          onPress: () => setDeleteConceptModal({ isOpen: true, confirmCallback: deleteConcept }),
          className: 'text-negative-700',
        },
  ].filter(isDefined)
}
