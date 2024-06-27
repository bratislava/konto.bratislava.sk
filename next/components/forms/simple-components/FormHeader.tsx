import {
  BinIcon,
  ConnectionIcon,
  DiscIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  PdfIcon,
} from '@assets/ui-icons'
import { getUiOptions } from '@rjsf/utils'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Waves from 'components/forms/simple-components/Waves/Waves'
import { SchemaUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { useFormExportImport } from '../../../frontend/hooks/useFormExportImport'
import { useFormContext } from '../useFormContext'
import { useFormModals } from '../useFormModals'

const FormHeader = () => {
  const {
    formDefinition: {
      schemas: { schema, uiSchema },
    },
    isTaxForm,
    isReadonly,
    isDeletable,
  } = useFormContext()
  const {
    exportXml,
    exportPdf,
    importXml,
    saveConcept,
    deleteConcept,
    showImportExportJson,
    importJson,
    exportJson,
  } = useFormExportImport()
  const { t } = useTranslation('forms')

  const { setDeleteConceptModal } = useFormModals()

  const formHeaderMenuContent = [
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="size-6" />,
      onPress: exportXml,
    },
    isTaxForm
      ? null
      : { title: t('menu_list.pdf'), icon: <PdfIcon className="size-6" />, onPress: exportPdf },
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
          itemClassName: 'text-negative-700',
        },
  ].filter(Boolean) as MenuItemBase[]

  const uiOptions = getUiOptions(uiSchema) as SchemaUiOptions

  const headerUrl =
    typeof uiOptions?.moreInformationUrl === 'string' ? uiOptions.moreInformationUrl : undefined

  return (
    <div className="relative flex flex-col">
      <div className="min-h-none size-full bg-main-200 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
        <div className="mx-auto flex max-w-screen-lg justify-between">
          <div className="flex flex-col gap-2 lg:gap-4">
            <h1 className="text-h1-form">{schema.title}</h1>
            {headerUrl && (
              <Link className="text-p1-underline w-max" href={headerUrl} target="_blank">
                {t('form_header.services_link')}
              </Link>
            )}
          </div>
          <div className="hidden h-full shrink-0 gap-3 lg:flex">
            {!isReadonly && (
              <ButtonNew
                size="small"
                variant="category-outline"
                startIcon={<DiscIcon className="size-5" />}
                onPress={() => saveConcept()}
                data-cy="save-concept-desktop"
              >
                {t('menu_list.save_concept')}
              </ButtonNew>
            )}
            <MenuDropdown
              buttonTrigger={
                <ButtonNew
                  variant="category-outline"
                  size="small"
                  icon={<EllipsisVerticalIcon />}
                  aria-label="Menu"
                />
              }
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
    </div>
  )
}

export default FormHeader
