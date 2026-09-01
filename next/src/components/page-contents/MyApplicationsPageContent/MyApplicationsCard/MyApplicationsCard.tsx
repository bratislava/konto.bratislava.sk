import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseSimpleDto } from 'openapi-clients/forms'
import { useState } from 'react'

import { formatDate } from '@/src/components/formatting/FormatDate'
import Icon from '@/src/components/icon-components/Icon'
import BottomSheetMenuModal from '@/src/components/page-contents/MyApplicationsPageContent/BottomSheetMenu/BottomSheetMenuModal'
import { useDeleteFormConcept } from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsCard/useDeleteFormConcept'
import { useExportFormToPdf } from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsCard/useExportFormToPdf'
import { useExportFormToXml } from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsCard/useExportFormToXml'
import { useFormDefinitionSlugTitleMap } from '@/src/components/page-contents/MyApplicationsPageContent/useFormDefinitionSlugTitleMap'
import DropdownMenu, {
  DropdownMenuItemProps,
} from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import Tag from '@/src/components/simple-components/Tag'
import MessageModal from '@/src/components/widget-components/Modals/MessageModal'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  form: GetFormResponseSimpleDto
  refreshListData: () => Promise<void>
}

// TODO Handle centrally, maybe by including form type into formDefinitionSlugTitleMap
const isTaxForm = ({ formSlug }: { formSlug: string }) => {
  return formSlug === 'priznanie-k-dani-z-nehnutelnosti'
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationsCard = ({ form, refreshListData }: Props) => {
  const { t } = useTranslation()

  const [showDeleteFormConceptModal, setShowDeleteFormConceptModal] = useState<boolean>(false)
  const [isBottomSheetMenuOpen, setIsBottomSheetMenuOpen] = useState(false)

  const { exportFormToXml } = useExportFormToXml({ form })
  const { exportFormToPdf } = useExportFormToPdf({ form })
  const { deleteFormConcept } = useDeleteFormConcept({ form, refreshListData })

  const formSlug = form.formDefinitionSlug

  const formDefinitionSlugTitleMap = useFormDefinitionSlugTitleMap()
  const cardTitle = formSlug ? formDefinitionSlugTitleMap[formSlug] : undefined

  const formPageHref = ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(formSlug, form.id)
  const detailPageHref = ROUTES.MY_APPLICATION_DETAIL(form.id)

  const isEditable = form.state === 'DRAFT' || form.state === 'ERROR'

  const dateToDisplay = isEditable
    ? {
        label: t('MyApplicationsCard.createdAt'),
        value: formatDate(form.createdAt),
      }
    : {
        label: 'Dátum aktualizácie',
        value: formatDate(form.updatedAt),
        // TODO
        // - Backend needs to add sentAt to the GetFormResponseSimpleDto
        // - Afterwards we will use this:
        // label: t('MyApplicationsCard.sentAt'),
        // value: formatDate(form.sentAt ?? form.updatedAt),
      }

  const canDownloadPdf = !isTaxForm({ formSlug })
  const conceptMenuItems: DropdownMenuItemProps[] = [
    {
      title: t('MyApplicationsCard.menu.downloadXml'),
      icon: <Icon name="download" className="size-6" />,
      onPress: () => exportFormToXml(),
    },
    canDownloadPdf
      ? {
          title: t('MyApplicationsCard.menu.downloadPdf'),
          icon: <Icon name="pdf" className="size-6" />,
          onPress: () => exportFormToPdf(),
        }
      : null,
    {
      title: t('MyApplicationsCard.menu.delete'),
      itemClassName: 'text-negative-700',
      icon: <Icon name="bin" className="size-6" />,
      onPress: () => setShowDeleteFormConceptModal(true),
    },
  ].filter(isDefined)

  const detailPageDesktopButton = (
    <Button
      variant="icon-wrapped"
      href={detailPageHref}
      target="_blank"
      hasLinkIcon={false}
      endIcon={<Icon name="chevron-right" />}
      aria-label={t('MyApplicationsCard.button.view')}
      stretched
    />
  )

  const detailPageMobileButton = (
    <Button
      variant="link"
      href={detailPageHref}
      target="_blank"
      className="p-0 no-underline"
      stretched
    >
      {t('MyApplicationsCard.button.view')}
    </Button>
  )

  const openConceptMenuMobileButton = (
    <Button
      variant="icon-wrapped-negative-margin"
      aria-label={t('MyApplicationsCard.conceptMenu.aria')}
      onPress={() => setIsBottomSheetMenuOpen(true)}
      icon={<Icon name="menu-kebab" />}
    />
  )

  const openConceptMenuDesktopButton = (
    <DropdownMenu
      buttonTrigger={
        <Button
          variant="icon-wrapped-negative-margin"
          icon={<Icon name="menu-kebab" />}
          aria-label={t('MyApplicationsCard.conceptMenu.aria')}
        />
      }
      items={conceptMenuItems}
    />
  )

  const editDraftButton = (
    <Button
      variant="outline-soft"
      startIcon={<Icon name="edit" className="size-6" />}
      href={formPageHref}
      hasLinkIcon={false}
      target="_blank"
      className="grow"
    >
      {t('MyApplicationsCard.button.continue')}
    </Button>
  )

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col gap-4 bg-background-passive-base py-4 lg:flex-row lg:items-center lg:gap-8 lg:rounded-sm',
          {
            'wrapper-focus-ring focus-within:[&:has(:focus-visible)]:z-1': !isEditable,
          },
        )}
      >
        <div className="flex max-w-150 grow flex-col items-start gap-2">
          {isEditable && <Tag variant="warning" text={t('MyApplicationsCard.conceptTag')} />}
          <Typography variant="h5" as="h2" className={cn({ 'group-hover:underline': !isEditable })}>
            {cardTitle}
          </Typography>
        </div>
        <div className="flex flex-col lg:mr-auto lg:gap-2">
          <Typography className="font-medium">{dateToDisplay.label}</Typography>
          <Typography>{dateToDisplay.value}</Typography>
        </div>
        {/* Buttons - mobile */}
        <div className="lg:hidden">
          {isEditable ? (
            <div className="flex flex-row gap-4">
              {editDraftButton}
              {openConceptMenuMobileButton}
            </div>
          ) : (
            detailPageMobileButton
          )}
        </div>
        {/* Buttons - desktop */}
        <div className="max-lg:hidden">
          {isEditable ? (
            <div className="flex flex-row gap-4">
              {editDraftButton}
              {openConceptMenuDesktopButton}
            </div>
          ) : (
            detailPageDesktopButton
          )}
        </div>
      </div>
      <MessageModal
        title={t('FormModals.conceptDeleteModal.title')}
        type="error"
        isOpen={showDeleteFormConceptModal}
        onOpenChange={() => setShowDeleteFormConceptModal(false)}
        primaryButton={
          <Button
            variant="negative-solid"
            onPress={() => {
              setShowDeleteFormConceptModal(false)

              return deleteFormConcept()
            }}
          >
            {t('FormModals.conceptDeleteModal.buttonTitle')}
          </Button>
        }
        secondaryButton={
          <Button variant="plain" onPress={() => setShowDeleteFormConceptModal(false)}>
            {t('FormModals.closeButton')}
          </Button>
        }
      >
        {t('FormModals.conceptDeleteModal.content')}
      </MessageModal>
      <BottomSheetMenuModal
        isOpen={isBottomSheetMenuOpen}
        setIsOpen={setIsBottomSheetMenuOpen}
        conceptMenuContent={[
          {
            title: t('MyApplicationsCard.button.continue'),
            icon: <Icon name={'edit'} className="size-6" />,
            url: formPageHref,
          },
          ...conceptMenuItems,
        ]}
      />
    </>
  )
}

export default MyApplicationsCard
