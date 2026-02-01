import {
  BinIcon,
  ChevronRightIcon,
  DownloadIcon,
  EditIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PdfIcon,
} from '@assets/ui-icons'
import { formsClient } from '@clients/forms'
import Button from 'components/forms/simple-components/ButtonNew'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import MessageModal from 'components/forms/widget-components/Modals/MessageModal'
import { ROUTES } from 'frontend/api/constants'
import useFormStateComponents from 'frontend/hooks/useFormStateComponents'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { downloadBlob } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { GetFormResponseDtoStateEnum, GetFormResponseSimpleDto } from 'openapi-clients/forms'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import ConditionalWrap from '../../../simple-components/ConditionalWrap'
import FormatDate from '../../../simple-components/FormatDate'
import BottomSheetMenuModal from './BottomSheetMenu/BottomSheetMenuModal'

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

// designs here https://www.figma.com/file/SFbuULqG1ysocghIga9BZT/Bratislavske-konto%2C-ESBS---ready-for-dev-(Ma%C5%A5a)?node-id=7120%3A20498&mode=dev
// TODO write docs

const MyApplicationsCard = ({
  form,
  refreshListData,
  variant,
  formDefinitionSlugTitleMap,
}: MyApplicationsCardProps) => {
  // TODO Translations
  const { t } = useTranslation(['account', 'forms'])

  const [deleteConceptModalShow, setDeleteConceptModalShow] = useState<boolean>(false)

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
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
    openSnackbarInfo(t('forms:info_messages.xml_export'))
    try {
      if (!formId) throw new Error('No form id provided for exportXml')
      const response = await formsClient.convertControllerConvertJsonToXmlV2(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken' },
      )
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('forms:success_messages.xml_export'))
    } catch (error) {
      openSnackbarError(t('forms:errors.xml_export'))
      logger.error(JSON.stringify(error))
    }
  }

  const exportPdf = async () => {
    openSnackbarInfo(t('forms:info_messages.pdf_export'))
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
      closeSnackbarInfo()
      openSnackbarSuccess(t('forms:success_messages.pdf_export'))
    } catch (error) {
      logger.error(error)
      openSnackbarError(t('forms:errors.pdf_export'))
    }
  }

  const deleteConcept = async () => {
    openSnackbarInfo(t('forms:info_messages.concept_delete'))
    try {
      if (!formId) throw new Error(`No formId provided on deleteConcept`)
      await formsClient.nasesControllerDeleteForm(formId, {
        authStrategy: 'authOrGuestWithToken',
      })
      closeSnackbarInfo()
      openSnackbarSuccess(t('forms:success_messages.concept_delete'))
      await refreshListData()
    } catch (error) {
      logger.error(error)
      openSnackbarError(t('forms:errors.concept_delete'))
    }
  }

  const conceptMenuContent: MenuItemBase[] = canDownloadPdf
    ? [
        {
          title: t('account_section_applications.concept_menu_list.download_xml'),
          icon: <DownloadIcon className="size-6" />,
          onPress: () => exportXml(),
        },
        {
          title: t('account_section_applications.concept_menu_list.download_pdf'),
          icon: <PdfIcon className="size-6" />,
          onPress: () => exportPdf(),
        },
        {
          title: t('account_section_applications.concept_menu_list.delete'),
          itemClassName: 'text-negative-700',
          icon: <BinIcon className="size-6" />,
          onPress: () => setDeleteConceptModalShow(true),
        },
      ]
    : [
        {
          title: t('account_section_applications.concept_menu_list.download_xml'),
          icon: <DownloadIcon className="size-6" />,
          onPress: () => exportXml(),
        },
        {
          title: t('account_section_applications.concept_menu_list.delete'),
          itemClassName: 'text-negative-700',
          icon: <BinIcon className="size-6" />,
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
        <div className="relative flex w-full items-stretch rounded-lg border-2 border-gray-200 bg-white p-6 max-lg:hidden">
          <div className="flex w-full gap-6">
            <div className="flex w-full grow flex-col gap-1">
              {(category || isLoading) && (
                <div className="text-p3-semibold text-main-700">
                  {isLoading ? <Skeleton width="25%" /> : category}
                </div>
              )}
              <h3 className="text-20-semibold">{isLoading ? <Skeleton width="75%" /> : subject}</h3>
              {(createdAt || isLoading) && (
                <div className="text-p3">
                  {isLoading ? (
                    <Skeleton width="50%" />
                  ) : (
                    <FormatDate>{createdAt || ''}</FormatDate>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-10">
              {variant !== 'DRAFT' && (
                <div className="flex gap-2">
                  {!isLoading && stateIconAndText.icon}
                  <div className="flex w-[200px] flex-col gap-1">
                    <div className="text-16-semibold">
                      {isLoading ? <Skeleton width="50%" /> : stateIconAndText.text}
                    </div>
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
                  <ChevronRightIcon />
                ) : (
                  <>
                    <Button
                      variant="black-outline"
                      startIcon={
                        isEditable ? (
                          <EditIcon className="size-5" />
                        ) : (
                          <EyeIcon className="size-5" />
                        )
                      }
                      href={formPageHref}
                      target="_blank"
                      className="w-[148px]"
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
                          variant="black-outline"
                          icon={<EllipsisVerticalIcon />}
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
        <div className="relative flex w-full items-start justify-between border-b-2 border-gray-200 bg-white py-4 lg:hidden">
          <div className="flex w-full justify-between gap-1.5">
            <div className="flex w-full grow flex-col">
              <div className="flex flex-row justify-between gap-6">
                {(category || isLoading) && (
                  <div className="text-p3-semibold text-main-700">
                    {isLoading ? <Skeleton width="25%" /> : category}
                  </div>
                )}
                {variant !== 'SENT' && category && <EllipsisVerticalIcon />}
              </div>
              <h3 className="pb-3 text-20-semibold">
                {isLoading ? <Skeleton width="75%" /> : subject}
              </h3>

              <span className="flex flex-row justify-between">
                {(createdAt || isLoading) && (
                  <span className="flex items-center text-p3">
                    {isLoading ? (
                      <Skeleton width="50%" />
                    ) : (
                      <FormatDate>{createdAt || ''}</FormatDate>
                    )}
                  </span>
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
        buttons={[
          <Button variant="black-plain" onPress={() => setDeleteConceptModalShow(false)}>
            {t('forms:modals_close_button_title')}
          </Button>,
          <Button
            variant="negative-solid"
            onPress={() => {
              setDeleteConceptModalShow(false)
              return deleteConcept()
            }}
          >
            {t('forms:concept_delete_modal.button_title')}
          </Button>,
        ]}
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
            icon: isEditable ? <EditIcon className="size-6" /> : <EyeIcon className="size-6" />,
            url: formPageHref,
          },
          ...conceptMenuContent,
        ]}
      />
    </>
  )
}

export default MyApplicationsCard
