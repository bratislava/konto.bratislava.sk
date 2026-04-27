import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { DiscIcon, EllipsisVerticalIcon } from '@/src/assets/ui-icons'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormMenuItems } from '@/src/components/forms/useFormMenuItems'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import MenuDropdown from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import MLink from '@/src/components/simple-components/MLink'
import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'

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
    <SectionContainer className="size-full bg-gray-50 py-6 lg:min-h-[120px] lg:py-12">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Typography variant="h1" className="text-size-h2-r lg:text-size-h1">
            {schema.title}
          </Typography>
          {strapiForm?.moreInformationUrl ? (
            <MLink
              variant="underlined"
              className="w-max text-size-p-small-r lg:text-size-p-large"
              href={strapiForm.moreInformationUrl}
              target="_blank"
            >
              {t('form_header.services_link')}
            </MLink>
          ) : null}
        </div>
        <div className="hidden h-full shrink-0 gap-3 lg:flex">
          {!isReadonly && (
            <Button
              size="small"
              variant="outline"
              startIcon={<DiscIcon />}
              onPress={() => saveConcept()}
              data-cy="save-concept-desktop"
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
                aria-label={t('form_header.additional_fom_action_menu_aria_label')}
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
