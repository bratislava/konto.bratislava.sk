import { Button, Typography } from '@bratislava/component-library'
import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDtoStateEnum, GetFormResponseSimpleDto } from 'openapi-clients/forms'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { formsClient } from '@/src/clients/forms'
import FormatDate from '@/src/components/formatting/FormatDate'
import Icon from '@/src/components/icon-components/Icon'
import ConditionalWrap from '@/src/components/layouts/ConditionalWrap'
import BottomSheetMenuModal from '@/src/components/page-contents/MyApplicationsPageContent/BottomSheetMenu/BottomSheetMenuModal'
import MenuDropdown, {
  MenuItemBase,
} from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import useToast from '@/src/components/simple-components/Toast/useToast'
import MessageModal from '@/src/components/widget-components/Modals/MessageModal'
import useFormStateComponents from '@/src/frontend/hooks/useFormStateComponents'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'
import { ROUTES } from '@/src/utils/routes'

export type MyApplicationsCardVariant = 'DRAFT' | 'SENDING' | 'SENT'

export type MyApplicationsCardProps = {
  form?: GetFormResponseSimpleDto | null
  refreshListData: () => Promise<[void, boolean]>
  variant: MyApplicationsCardVariant
  formDefinitionSlugTitleMap: Record<string, string>
}

export type WrapperProps = {
  children?: React.ReactNode
  variant: MyApplicationsCardVariant
  href?: string
  onClick?: () => void
}

const Wrapper = ({ children, variant, href, onClick }: WrapperProps) => {
  return variant === 'SENT' && href ? (
    <Link href={href}>{children}</Link>
  ) : (
    <Button className="relative w-full bg-white text-left lg:hidden" onPress={onClick}>
      {children}
    </Button>
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-6052&t=MkpmmyHKdgx0IlKq-4
 */

const MyApplicationsCard = ({
  form,
  refreshListData,
  variant,
  formDefinitionSlugTitleMap,
}: MyApplicationsCardProps) => {
  // TODO Translations
  const { t } = useTranslation(['account', 'forms'])

  const [deleteConceptModalShow, setDeleteConceptModalShow] = useState<boolean>(false)

  const { showToast, closeToasts } = useToast()
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState(false)

  // everything used in jsx should get mapped here
  const isLoading = !form
  const subject = form?.formSubject
  const formSlug = form?.formDefinitionSlug
  const category = formSlug ? formDefinitionSlugTitleMap[formSlug] : undefined
  const createdAt = form?.createdAt
  // TODO replace - this won't be valid for forms processed on the GINIS side
  const updatedAt = form?.updatedAt
  const formId = form?.id
  const state = form?.state
  const error = form?.error
  const isTaxForm = formSlug === 'priznanie-k-dani-z-nehnutelnosti'
  const canDownloadPdf = !isTaxForm

  // derived state
  const formPageHref = `${ROUTES.MUNICIPAL_SERVICES}/${formSlug}/${form?.id}`
  const detailPageHref = `${ROUTES.MY_APPLICATIONS}/${form?.id}`
  // TODO verify the error state
  const isEditable = state && ['DRAFT', 'ERROR'].includes(state)

  // xml and pdf exports copied from useFormExportImport
  // TODO refactor, same as next/frontend/hooks/useFormExportImport.tsx
  const exportXml = async () => {
    showToast({ message: t('forms:info_messages.xml_export'), variant: 'info' })
    try {
      if (!formId) throw new Error('No form id provided for exportXml')
      const response = await formsClient.convertControllerConvertJsonToXmlV2(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken' },
      )
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data]), fileName)
      closeToasts()
      showToast({ message: t('forms:success_messages.xml_export'), variant: 'success' })
    } catch (error) {
      showToast({ message: t('forms:errors.xml_export'), variant: 'error' })
      logger.error(JSON.stringify(error))
    }
  }

  const exportPdf = async () => {
    showToast({ message: t('forms:info_messages.pdf_export'), variant: 'info' })
    try {
      if (!formSlug || !formId)
        throw new Error(
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          `No formSlug or form id ${formId && `for form id: ${formId}`}`,
        )
      const response = await formsClient.convertControllerConvertToPdf(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken', responseType: 'arraybuffer' },
      )
      const fileName = `${formSlug}_output.pdf`
      downloadBlob(new Blob([response.data as BlobPart]), fileName)
      closeToasts()
      showToast({ message: t('forms:success_messages.pdf_export'), variant: 'success' })
    } catch (error) {
      logger.error(error)
      showToast({ message: t('forms:errors.pdf_export'), variant: 'error' })
    }
  }

  const deleteConcept = async () => {
    showToast({ message: t('forms:info_messages.concept_delete'), variant: 'info' })
    try {
      if (!formId) throw new Error(`No formId provided on deleteConcept`)
      await formsClient.nasesControllerDeleteForm(formId, {
        authStrategy: 'authOrGuestWithToken',
      })
      closeToasts()
      showToast({ message: t('forms:success_messages.concept_delete'), variant: 'success' })
      await refreshListData()
    } catch (error) {
      logger.error(error)
      showToast({ message: t('forms:errors.concept_delete'), variant: 'error' })
    }
  }

  const conceptMenuContent: MenuItemBase[] = canDownloadPdf
    ? [
        {
          title: t('account_section_applications.concept_menu_list.download_xml'),
          icon: <Icon name="download" className="size-6" />,
          onPress: () => exportXml(),
        },
        {
          title: t('account_section_applications.concept_menu_list.download_pdf'),
          icon: <Icon name="pdf" className="size-6" />,
          onPress: () => exportPdf(),
        },
        {
          title: t('account_section_applications.concept_menu_list.delete'),
          itemClassName: 'text-negative-700',
          icon: <Icon name="bin" className="size-6" />,
          onPress: () => setDeleteConceptModalShow(true),
        },
      ]
    : [
        {
          title: t('account_section_applications.concept_menu_list.download_xml'),
          icon: <Icon name="download" className="size-6" />,
          onPress: () => exportXml(),
        },
        {
          title: t('account_section_applications.concept_menu_list.delete'),
          itemClassName: 'text-negative-700',
          icon: <Icon name="bin" className="size-6" />,
          onPress: () => setDeleteConceptModalShow(true),
        },
      ]

  const stateIconAndText = useFormStateComponents({ error, state })

  const openBottomSheetModal = () => {
    if (variant === 'SENT') return
    setBottomSheetIsOpen(true)
  }

  return (
    <>
      <ConditionalWrap
        condition={variant === 'SENT'}
        wrap={(children) => <Link href={detailPageHref}>{children}</Link>}
      >
        {/* Desktop */}
        <div className="relative flex w-full items-stretch rounded-lg border border-gray-200 bg-white p-6 max-lg:hidden">
          <div className="flex w-full gap-6">
            <div className="flex w-full grow flex-col gap-1">
              {(category || isLoading) && (
                <Typography variant="p-tiny" as="div" className="font-semibold">
                  {isLoading ? <Skeleton width="25%" /> : category}
                </Typography>
              )}
              <Typography variant="h5" as="h3">
                {isLoading ? <Skeleton width="75%" /> : subject}
              </Typography>
              {(createdAt || isLoading) && (
                <Typography variant="p-tiny" as="div">
                  {isLoading ? (
                    <Skeleton width="50%" />
                  ) : (
                    <FormatDate>{createdAt || ''}</FormatDate>
                  )}
                </Typography>
              )}
            </div>

            <div className="flex items-center gap-10">
              {variant !== 'DRAFT' && (
                <div className="flex gap-2">
                  {!isLoading && stateIconAndText.icon}
                  <div className="flex w-[200px] flex-col gap-1">
                    <Typography variant="p-small" as="div" className="font-semibold">
                      {isLoading ? <Skeleton width="50%" /> : stateIconAndText.text}
                    </Typography>
                    {variant === 'SENT' &&
                      (isLoading ? (
                        <Skeleton width="75%" />
                      ) : state === GetFormResponseDtoStateEnum.Processing ? null : (
                        <FormatDate>{updatedAt || ''}</FormatDate>
                      ))}
                  </div>
                </div>
              )}

              {/* Width of this div is computed to match layout of SentCard */}
              <div className="flex w-[242px] items-center justify-end gap-4">
                {isLoading ? (
                  <Skeleton width="100px" height="20px" />
                ) : variant === 'SENT' ? (
                  <Icon name="chevron-right" />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      startIcon={
                        isEditable ? (
                          <Icon name="edit" className="size-5 shrink-0" />
                        ) : (
                          <Icon name="eye" className="size-5 shrink-0" />
                        )
                      }
                      href={formPageHref}
                      target="_blank"
                      className="w-[148px]"
                      hasLinkIcon={false}
                    >
                      {isEditable
                        ? variant === 'DRAFT'
                          ? t(
                              'account_section_applications.navigation_concept_card.continue_button_text',
                            )
                          : t(
                              'account_section_applications.navigation_concept_card.edit_button_text',
                            )
                        : t(
                            'account_section_applications.navigation_concept_card.view_button_text',
                          )}
                    </Button>
                    <MenuDropdown
                      buttonTrigger={
                        <Button
                          variant="outline"
                          icon={<Icon name="menu-kebab" />}
                          aria-label="Menu"
                        />
                      }
                      items={conceptMenuContent}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ConditionalWrap>
      {/* Mobile */}
      <Wrapper
        variant={variant}
        href={variant === 'SENT' ? detailPageHref : formPageHref}
        onClick={openBottomSheetModal}
      >
        <div className="relative flex w-full items-start justify-between border-b border-gray-200 bg-white py-4 lg:hidden">
          <div className="flex w-full justify-between gap-1.5">
            <div className="flex w-full grow flex-col">
              <div className="flex flex-row justify-between gap-6">
                {(category || isLoading) && (
                  <Typography variant="p-tiny" as="div" className="font-semibold">
                    {isLoading ? <Skeleton width="25%" /> : category}
                  </Typography>
                )}
                {variant !== 'SENT' && category && <Icon name="menu-kebab" />}
              </div>
              <Typography variant="h5" as="h3" className="pb-3">
                {isLoading ? <Skeleton width="75%" /> : subject}
              </Typography>

              <span className="flex flex-row justify-between">
                {(createdAt || isLoading) && (
                  <Typography variant="p-tiny" as="span" className="flex items-center">
                    {isLoading ? (
                      <Skeleton width="50%" />
                    ) : (
                      <FormatDate>{createdAt || ''}</FormatDate>
                    )}
                  </Typography>
                )}

                {stateIconAndText.iconRound}
              </span>
            </div>
          </div>
        </div>
      </Wrapper>
      <MessageModal
        title={t('forms:concept_delete_modal.title')}
        type="error"
        isOpen={deleteConceptModalShow}
        onOpenChange={() => setDeleteConceptModalShow(false)}
        primaryButton={
          <Button
            variant="negative-solid"
            onPress={() => {
              setDeleteConceptModalShow(false)

              return deleteConcept()
            }}
          >
            {t('forms:concept_delete_modal.button_title')}
          </Button>
        }
        secondaryButton={
          <Button variant="plain" onPress={() => setDeleteConceptModalShow(false)}>
            {t('forms:modal.close_button_label')}
          </Button>
        }
      >
        {t('forms:concept_delete_modal.content_with_name', { conceptName: subject })}
      </MessageModal>
      <BottomSheetMenuModal
        isOpen={bottomSheetIsOpen}
        setIsOpen={setBottomSheetIsOpen}
        conceptMenuContent={[
          {
            title: isEditable
              ? variant === 'DRAFT'
                ? t('account_section_applications.navigation_concept_card.continue_button_text')
                : t('account_section_applications.navigation_concept_card.edit_button_text')
              : t('account_section_applications.navigation_concept_card.view_button_text'),
            icon: isEditable ? (
              <Icon name="edit" className="size-6" />
            ) : (
              <Icon name="eye" className="size-6" />
            ),
            url: formPageHref,
          },
          ...conceptMenuContent,
        ]}
      />
    </>
  )
}

export default MyApplicationsCard
