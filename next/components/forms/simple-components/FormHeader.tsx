import { DiscIcon, EllipsisVerticalIcon } from '@assets/ui-icons'
import Button from 'components/forms/simple-components/Button'
import MenuDropdown from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { useFormExportImport } from '../../../frontend/hooks/useFormExportImport'
import { useFormContext } from '../useFormContext'
import { useFormMenuItems } from '../useFormMenuItems'

const FormHeader = () => {
  const {
    formDefinition: { schema },
    isReadonly,
    strapiForm,
  } = useFormContext()
  const { saveConcept } = useFormExportImport()
  const { t } = useTranslation('forms')

  const menuItems = useFormMenuItems()

  return (
    <div className="relative flex flex-col">
      <div className="min-h-none size-full bg-gray-50 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
        <div className="mx-auto flex max-w-(--breakpoint-lg) justify-between">
          <div className="flex flex-col gap-2 lg:gap-4">
            <h1 className="text-h1-form">{schema.title}</h1>
            {strapiForm?.moreInformationUrl ? (
              <Link
                className="w-max text-p1 underline"
                href={strapiForm.moreInformationUrl}
                target="_blank"
              >
                {t('form_header.services_link')}
              </Link>
            ) : null}
          </div>
          <div className="hidden h-full shrink-0 gap-3 lg:flex">
            {!isReadonly && (
              <Button
                size="small"
                variant="outline"
                startIcon={<DiscIcon className="size-5" />}
                onPress={() => saveConcept()}
                data-cy="save-concept-desktop"
                className="border-gray-700 data-hovered:border-gray-600 data-pressed:border-gray-800" // TODO remove when Button is updated according to DS
              >
                {t('menu_list.save_concept')}
              </Button>
            )}
            <MenuDropdown
              buttonTrigger={
                <Button
                  variant="outline"
                  size="small"
                  icon={<EllipsisVerticalIcon />}
                  aria-label="Menu"
                  className="border-gray-700 data-hovered:border-gray-600 data-pressed:border-gray-800" // TODO remove when Button is updated according to DS
                />
              }
              items={menuItems}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormHeader
