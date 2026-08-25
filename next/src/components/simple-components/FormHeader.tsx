import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormMenuItems } from '@/src/components/forms/useFormMenuItems'
import Icon from '@/src/components/icon-components/Icon'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import DropdownMenu from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'

const FormHeader = () => {
  const { t } = useTranslation()

  const {
    formDefinition: { schema },
    isReadonly,
    strapiForm,
  } = useFormContext()
  const { saveConcept } = useFormExportImport()

  const menuItems = useFormMenuItems()

  return (
    <SectionContainer className="size-full bg-gray-50 py-6 lg:min-h-[120px] lg:py-12">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Typography variant="h1">{schema.title}</Typography>
          {strapiForm?.moreInformationUrl ? (
            <Button
              variant="link"
              size="large"
              className="w-max"
              href={strapiForm.moreInformationUrl}
              // We append service name to the link text to give user more context when using screen reader
              aria-label={t('FormHeader.servicesLink.ariaLabel', {
                serviceName: schema.title,
              })}
            >
              {t('FormHeader.servicesLink')}
            </Button>
          ) : null}
        </div>
        <div className="hidden h-full shrink-0 gap-3 lg:flex">
          {!isReadonly && (
            <Button
              size="small"
              variant="outline"
              startIcon={<Icon name="save" />}
              onPress={() => saveConcept()}
              data-cy="save-concept-desktop"
            >
              {t('useFormMenuItems.saveConcept')}
            </Button>
          )}
          <DropdownMenu
            buttonTrigger={
              <Button
                variant="outline"
                size="small"
                icon={<Icon name="menu-kebab" />}
                aria-label={t('FormHeader.aria.actionsMenu')}
              />
            }
            items={menuItems}
          />
        </div>
      </div>
    </SectionContainer>
  )
}

export default FormHeader
