import {
  BinIcon,
  ChevronRightIcon,
  DownloadIcon,
  EditIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PdfIcon,
} from '@assets/ui-icons'
import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import Button from 'components/forms/simple-components/ButtonNew'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import MessageModal from 'components/forms/widget-components/Modals/MessageModal'
import ConditionalWrap from 'conditional-wrap'
import { ROUTES } from 'frontend/api/constants'
import useFormStateComponents from 'frontend/hooks/useFormStateComponents'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { downloadBlob } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import _ from 'lodash'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import FormatDate from '../../../simple-components/FormatDate'
import BottomSheetMenuModal from './BottomSheetMenu/BottomSheetMenuModal'

export type MyApplicationsCardVariant = 'DRAFT' | 'SENDING' | 'SENT'

export type MyApplicationsCardProps = {
  form?: GetFormResponseDto | null
  refreshListData: () => Promise<unknown>
  variant: MyApplicationsCardVariant
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

// eslint-disable-next-line no-secrets/no-secrets
// designs here https://www.figma.com/file/SFbuULqG1ysocghIga9BZT/Bratislavske-konto%2C-ESBS---ready-for-dev-(Ma%C5%A5a)?node-id=7120%3A20498&mode=dev
// TODO write docs

const MyApplicationsCard = ({ form, refreshListData, variant }: MyApplicationsCardProps) => {
  const { t } = useTranslation('account')
  const { t: ft } = useTranslation('forms')
  const [deleteConceptModalShow, setDeleteConceptModalShow] = useState<boolean>(false)

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState(false)

  // everything used in jsx should get mapped here
  const isLoading = !form
  // TODO can be fixed by fixing OpenAPI types
  // until then, safe enough with all the fallbacks
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  const title =
    _.get(
      form?.formDataJson,
      form?.schemaVersion?.uiSchema['ui:options']?.titlePath || '__INVALID_PATH__',
    ) ||
    form?.schemaVersion?.uiSchema['ui:options']?.titleFallback ||
    ft('form_title_fallback')
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  const category = form?.schemaVersion.schema?.formName
  const createdAt = form?.createdAt
  // TODO replace - this won't be valid for forms processed on the GINIS side
  const updatedAt = form?.updatedAt
  const schemaVersionId = form?.schemaVersionId
  const formData = form?.schemaVersion?.data
  const formSlug = form?.schemaVersion.schema?.slug || ''
  const formId = form?.id
  const state = form?.state
  const error = form?.error
  const isLatestSchemaVersionForSlug = form?.isLatestSchemaVersionForSlug

  // derived state
  const formPageHref = `${ROUTES.MUNICIPAL_SERVICES}/${form?.schemaVersion.schema?.slug}/${form?.id}`
  const detailPageHref = `${ROUTES.MY_APPLICATIONS}/${form?.id}`
  // TODO verify the error state
  const isEditable = state && ['DRAFT', 'ERROR'].includes(state) && isLatestSchemaVersionForSlug

  // xml and pdf exports copied from useFormExportImport
  // TODO refactor, same as next/frontend/hooks/useFormExportImport.tsx
  const exportXml = async () => {
    openSnackbarInfo(ft('info_messages.xml_export'))
    try {
      if (!formData || !schemaVersionId)
        throw new Error(`No form data or schemaVersionId for form id: ${formId}`)
      const response = await formsApi.convertControllerConvertJsonToXml(
        schemaVersionId,
        {
          jsonForm: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      )
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data.xmlForm]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(ft('success_messages.xml_export'))
    } catch (error) {
      openSnackbarError(ft('errors.xml_export'))
      logger.error(JSON.stringify(error))
    }
  }

  const exportPdf = async () => {
    openSnackbarInfo(ft('info_messages.pdf_export'))
    try {
      if (!formData || !schemaVersionId)
        throw new Error(`No form data or schemaVersionId for form id: ${formId}`)
      const response = await formsApi.convertControllerConvertToPdf(
        schemaVersionId,
        {
          jsonForm: formData,
        },
        { accessToken: 'onlyAuthenticated', responseType: 'arraybuffer' },
      )
      const fileName = `${formSlug}_output.pdf`
      downloadBlob(new Blob([response.data as BlobPart]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(ft('success_messages.pdf_export'))
    } catch (error) {
      logger.error(error)
      openSnackbarError(ft('errors.pdf_export'))
    }
  }

  const deleteConcept = async () => {
    openSnackbarInfo(ft('info_messages.pdf_export'))
    try {
      if (!formId) throw new Error(`No formId provided on deleteConcept`)
      await formsApi.nasesControllerDeleteForm(formId, {
        accessToken: 'onlyAuthenticated',
      })
      closeSnackbarInfo()
      openSnackbarSuccess(ft('success_messages.pdf_export'))
      await refreshListData()
    } catch (error) {
      logger.error(error)
      openSnackbarError(ft('errors.pdf_export'))
    }
  }

  const conceptMenuContent: MenuItemBase[] = isLatestSchemaVersionForSlug
    ? [
        {
          title: t('account_section_applications.concept_menu_list.download_xml'),
          icon: <DownloadIcon className="h-6 w-6" />,
          onPress: () => exportXml(),
        },
        {
          title: t('account_section_applications.concept_menu_list.download_pdf'),
          icon: <PdfIcon className="h-6 w-6" />,
          onPress: () => exportPdf(),
        },
        {
          title: t('account_section_applications.concept_menu_list.delete'),
          itemClassName: 'text-negative-700',
          icon: <BinIcon className="h-6 w-6" />,
          onPress: () => setDeleteConceptModalShow(true),
        },
      ]
    : [
        {
          title: t('account_section_applications.concept_menu_list.download_xml'),
          icon: <DownloadIcon className="h-6 w-6" />,
          onPress: () => exportXml(),
        },
        {
          title: t('account_section_applications.concept_menu_list.delete'),
          itemClassName: 'text-negative-700',
          icon: <BinIcon className="h-6 w-6" />,
          onPress: () => setDeleteConceptModalShow(true),
        },
      ]

  const stateIconAndText = useFormStateComponents({ error, isLatestSchemaVersionForSlug, state })

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
              <h3 className="text-20-semibold">{isLoading ? <Skeleton width="75%" /> : title}</h3>
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
                      ) : (
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
                          <EditIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )
                      }
                      href={formPageHref}
                      target="_blank"
                      className="w-[148px]"
                    >
                      {t(
                        `account_section_applications.navigation_concept_card.${
                          isEditable ? 'edit' : 'view'
                        }_button_text`,
                      )}
                    </Button>
                    <MenuDropdown
                      // TOOD - fix styling
                      buttonTrigger={<EllipsisVerticalIcon />}
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
            <div className="flex w-full grow flex-col gap-1">
              <div className="flex flex-row justify-between gap-6">
                {(category || isLoading) && (
                  <div className="text-p3-semibold text-main-700">
                    {isLoading ? <Skeleton width="25%" /> : category}
                  </div>
                )}
              </div>

              <h3 className="text-20-semibold">{isLoading ? <Skeleton width="75%" /> : title}</h3>
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
            <div className="flex flex-col items-center justify-between">
              {category && <EllipsisVerticalIcon />}
              {stateIconAndText.iconRound}
            </div>
          </div>
        </div>
      </Wrapper>
      <MessageModal
        title={t('send_files_scanning_eid_modal.title')}
        type="error"
        isOpen={deleteConceptModalShow}
        buttons={[
          <Button onPress={() => setDeleteConceptModalShow(false)}>
            {t('modals_back_button_title')}
          </Button>,
          <Button
            variant="black-solid"
            onPress={() => {
              setDeleteConceptModalShow(false)
              return deleteConcept()
            }}
          >
            {t('send_files_scanning_eid_modal.button_title')}
          </Button>,
        ]}
      >
        {t('send_files_scanning_eid_modal.content')}
      </MessageModal>
      <BottomSheetMenuModal
        isOpen={bottomSheetIsOpen}
        setIsOpen={setBottomSheetIsOpen}
        conceptMenuContent={[
          {
            title: t(
              `account_section_applications.navigation_concept_card.${
                isEditable ? 'edit' : 'view'
              }_button_text`,
            ),
            icon: isEditable ? <EditIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />,
            url: formPageHref,
          },
          ...conceptMenuContent,
        ]}
      />
    </>
  )
}

export default MyApplicationsCard
