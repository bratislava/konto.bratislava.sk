import { DiscIcon, EllipsisVerticalIcon } from '@assets/ui-icons'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import MenuDropdown from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Waves from 'components/forms/simple-components/Waves/Waves'
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
      <div className="min-h-none bg-main-200 size-full p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
        <div className="mx-auto flex max-w-(--breakpoint-lg) justify-between">
          <div className="flex flex-col gap-2 lg:gap-4">
            <h1 className="text-h1-form">{schema.title}</h1>
            {strapiForm?.moreInformationUrl ? (
              <Link
                className="text-p1-underline w-max"
                href={strapiForm.moreInformationUrl}
                target="_blank"
              >
                {t('form_header.services_link')}
              </Link>
            ) : null}
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
              items={menuItems}
            />
          </div>
        </div>
      </div>
      <Waves className="hidden lg:block" waveColor="var(--color-main-200)" wavePosition="bottom" />
    </div>
  )
}

export default FormHeader
