import { useTranslation } from 'next-i18next/pages'

import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import { MenuItemBase } from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'
import { isDefined } from '@/src/frontend/utils/general'

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
          icon: <Icon name="save" className="size-6" />,

          onPress: () => saveConcept(),
          dataCy: 'save-concept-mobile',
        },
    xmlImportExportAllowed
      ? {
          title: t('menu_list.download_xml'),
          icon: <Icon name="download" className="size-6" />,

          onPress: () => exportXml(),
        }
      : null,
    pdfDownloadInMenuAllowed
      ? {
          title: t('menu_list.pdf'),
          icon: <Icon name="pdf" className="size-6" />,

          onPress: () => exportPdf(),
        }
      : null,
    !isReadonly && xmlImportExportAllowed
      ? {
          title: t('menu_list.upload_xml'),
          icon: <Icon name="import-export" className="size-6" />,
          onPress: importXml,
        }
      : null,
    jsonImportExportAllowed
      ? {
          title: t('menu_list.download_json'),
          icon: <Icon name="download" className="size-6" />,
          onPress: exportJson,
        }
      : null,
    !isReadonly && jsonImportExportAllowed
      ? {
          title: t('menu_list.upload_json'),
          icon: <Icon name="import-export" className="size-6" />,
          onPress: importJson,
        }
      : null,
    isDeletable
      ? null
      : {
          title: t('menu_list.delete'),
          icon: <Icon name="bin" className="size-6" />,
          onPress: () => setDeleteConceptModal({ isOpen: true, confirmCallback: deleteConcept }),
          className: 'text-negative-700',
        },
  ].filter(isDefined)
}
