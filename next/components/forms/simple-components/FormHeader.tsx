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
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { SchemaUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import { useFormExportImport } from '../../../frontend/hooks/useFormExportImport'
import { useFormModals } from '../useFormModals'
import { useFormState } from '../useFormState'

const FormHeader = () => {
  const { isReadonly, isDeletable, uiSchema, schema } = useFormState()
  const { exportXml, exportPdf, importXml, saveConcept, deleteConcept } = useFormExportImport()
  const { t } = useTranslation('forms')

  const { setDeleteConceptModal } = useFormModals()

  const formHeaderMenuContent = [
    {
      title: t('menu_list.download_xml'),
      icon: <DownloadIcon className="h-6 w-6" />,
      onPress: exportXml,
    },
    { title: t('menu_list.pdf'), icon: <PdfIcon className="h-6 w-6" />, onPress: exportPdf },
    !isReadonly
      ? {
          title: t('menu_list.upload_xml'),
          icon: <ConnectionIcon className="h-6 w-6" />,
          onPress: importXml,
        }
      : null,
    !isDeletable
      ? {
          title: t('menu_list.delete'),
          icon: <BinIcon className="h-6 w-6" />,
          onPress: () => setDeleteConceptModal({ isOpen: true, sendCallback: deleteConcept }),
          itemClassName: 'text-negative-700',
        }
      : null,
  ].filter(Boolean) as MenuItemBase[]

  const uiOptions = getUiOptions(uiSchema) as SchemaUiOptions

  const headerUrl =
    typeof uiOptions?.moreInformationUrl === 'string' ? uiOptions.moreInformationUrl : undefined

  return (
    <div className="relative flex flex-col">
      <div className="min-h-none h-full w-full bg-main-200 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
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
                startIcon={<DiscIcon className="h-5 w-5" />}
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
